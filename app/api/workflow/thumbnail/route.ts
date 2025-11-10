import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

interface InputType {
  videoId: string;
  userId: string;
  prompt: string;
}
export const { POST } = serve(async (context) => {
  const utapi = new UTApi();
  const input = context.requestPayload as InputType;
  const { videoId, userId, prompt } = input;
  const video = await context.run("get-video", async () => {
    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

    if (!existingVideo) throw new Error("Video not found");

    return existingVideo;
  });

  const { body } = await context.call<{ data: { url: string }[] }>(
    "generate-thumbnail",
    {
      url: "https://api.openai.com/v1/images/generations",
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: {
        prompt,
        n: 1,
        size: "1792x1024",
        model: "dall-e-3",
      },
    }
  );

  const tempImageUrl = body?.data[0]?.url;
  if (!tempImageUrl) throw new Error("Failed to generate thumbnail");

  await context.run("remove-current-image", async () => {
    if (video.thumbnailKey) {
      await utapi.deleteFiles(video.thumbnailKey);
    }
  });

  const uploadedThumbnail = await context.run(
    "uploaded-thumbnail",
    async () => {
      const { data } = await utapi.uploadFilesFromUrl(tempImageUrl);
      if (!data) throw new Error("Failed to upload thumbnail");

      return data;
    }
  );

  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({
        thumbnailKey: uploadedThumbnail.key,
        thumbnailUrl: uploadedThumbnail.ufsUrl,
        workflowThumbnailStatus: 'success'
      })
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));
  });
});
