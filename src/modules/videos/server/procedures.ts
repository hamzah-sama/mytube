import { db } from "@/db";
import { videos } from "@/db/schema";
import { mux } from "@/lib/mux";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const videoRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.auth;
      try {
        const upload = await mux.video.uploads.create({
          new_asset_settings: {
            passthrough: userId,
            playback_policies: ["public"],
          },
          cors_origin: "*",
        });
        const [newVideo] = await db
          .insert(videos)
          .values({
            title: input.title,
            userId,
            muxUploadedId: upload.id,
            muxStatus: upload.status,
          })
          .returning();

        return {
          url: upload.url,
          video: newVideo,
        };
      } catch (error) {
        console.error("Mux upload error: ", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to created video",
        });
      }
    }),
});
