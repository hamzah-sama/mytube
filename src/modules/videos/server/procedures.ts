import { db } from "@/db";
import { videos, videoUpdateSchema } from "@/db/schema";
import { mux } from "@/lib/mux";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import z from "zod";

const utApi = new UTApi();

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

  delete: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.auth;
      if (!userId)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "you must be logged in",
        });
      const { videoId } = input;
      if (!videoId)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "VideoId is required",
        });

      const [video] = await db
        .select({
          muxAssetId: videos.muxAssetId,
          previewKey: videos.previewKey,
          thumbnailKey: videos.thumbnailKey,
        })
        .from(videos)
        .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

      if (video.previewKey && video.thumbnailKey) {
        try {
          await utApi.deleteFiles([video.previewKey, video.thumbnailKey]);
        } catch (error) {
          console.error("Error deleting files on uploadthing: ", error);
        }
      }

      if (video.muxAssetId) {
        try {
          await utApi.deleteFiles([video.muxAssetId]);
        } catch (error) {
          console.error("Error deleting files on mux: ", error);
        }
      }

      await db.delete(videos).where(eq(videos.id, videoId));
    }),

  update: protectedProcedure
    .input(videoUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.auth;
      if (!userId)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "you must be logged in",
        });

      if (!input.id)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "VideoId is required",
        });

      const [data] = await db
        .update(videos)
        .set({
          title: input.title,
          description: input.description,
          visibility: input.visibility,
        })
        .where(eq(videos.id, input.id))
        .returning();
      return data;
    }),

  getStatus: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { userId } = ctx.auth;
      const [result] = await db
        .select({ status: videos.muxStatus })
        .from(videos)
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, userId)))
        .limit(1);
      return result ?? null;
    }),

  restoreThumbnail: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.auth;
      if (!userId)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "you must be logged in",
        });

      if (!input.videoId)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "VideoId is required",
        });

      const [video] = await db
        .select({
          thumbnailKey: videos.thumbnailKey,
          playbackId: videos.muxPlaybackId,
        })
        .from(videos)
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, userId)));

      if (video.thumbnailKey) {
        try {
          await utApi.deleteFiles([video.thumbnailKey]);
        } catch (error) {
          console.error("Error deleting files on uploadthing: ", error);
        }
      }

      if (!video.playbackId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "VideoId is required",
        });
      }

      const tempThumbnailUrl = `https://image.mux.com/${video.playbackId}/thumbnail.png`;

      const [thumbnail] = await utApi.uploadFilesFromUrl([tempThumbnailUrl]);

      if (!thumbnail.data)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to restore thumbnail",
        });

      const { key: thumbnailKey, ufsUrl: thumbnailUrl } = thumbnail.data;

      await db
        .update(videos)
        .set({
          thumbnailKey,
          thumbnailUrl,
        })
        .where(eq(videos.id, input.videoId))
        .returning();
    }),
});
