import { db } from "@/db";
import { users, videos } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import z from "zod";
import { auth } from "@clerk/nextjs/server";
import { th } from "zod/v4/locales";

const f = createUploadthing();
const utApi = new UTApi();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  thumbnailUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(z.object({ videoId: z.string() }))
    .middleware(async ({ input }) => {
      const { userId: clerkUserId } = await auth();

      if (!clerkUserId) throw new UploadThingError("Unauthorized");

      // check if the user exists
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUserId));

      if (!user) throw new UploadThingError("Unauthorized");

      // check if the video is owned by the user
      const [video] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, user.id)));

        if(!video) throw new UploadThingError("Forbidden");

      return { userId: user.id, ...input };
    })

    .onUploadComplete(async ({ metadata, file }) => {
      // check if the video exists
      const [existingVideo] = await db
        .select({ thumbnailKey: videos.thumbnailKey })
        .from(videos)
        .where(
          and(
            eq(videos.id, metadata.videoId),
            eq(videos.userId, metadata.userId)
          )
        );

      if (!existingVideo) {
        throw new UploadThingError("video is not found");
      }

      // check if the video already has a thumbnail and delete it if it does
      if (existingVideo.thumbnailKey) {
        await utApi.deleteFiles(existingVideo.thumbnailKey);
      }

      // update the video with the new thumbnail
      await db
        .update(videos)
        .set({
          thumbnailUrl: file.ufsUrl,
          thumbnailKey: file.key,
        })
        .where(
          and(
            eq(videos.id, metadata.videoId),
            eq(videos.userId, metadata.userId)
          )
        )
        .returning();

      return { uploadedBy: metadata.userId };
    }),
  bannerUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const { userId: clerkUserId } = await auth();

      if (!clerkUserId) throw new UploadThingError("Unauthorized");

      // check if the user exists in the database
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUserId));

      if (!user) throw new UploadThingError("Unauthorized");

      return { userId: user.id };
    })

    .onUploadComplete(async ({ metadata, file }) => {

      // check if user exists and delete the old banner if it exists
      const [existingUser] = await db
        .select({ bannerKey: users.bannerKey })
        .from(users)
        .where(and(eq(users.id, metadata.userId)));

      if (!existingUser) {
        throw new UploadThingError("user is not found");
      }

      if (existingUser.bannerKey) {
        await utApi.deleteFiles(existingUser.bannerKey);
      }

      // update the user with the new banner
      await db
        .update(users)
        .set({
          bannerUrl: file.ufsUrl,
          bannerKey: file.key,
        })
        .where(and(eq(users.id, metadata.userId)))
        .returning();

      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
