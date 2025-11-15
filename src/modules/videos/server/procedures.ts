import { db } from "@/db";
import {
  dislikeCount,
  likedCount,
  subscribersCount,
  users,
  videos,
  videoUpdateSchema,
  viewCount,
} from "@/db/schema";
import { mux } from "@/lib/mux";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import z from "zod";
import { Client } from "@upstash/workflow";

const utApi = new UTApi();

export const videoRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(z.object({ videoPlaybackId: z.string() }))
    .query(async ({ input }) => {
      const { videoPlaybackId } = input;

      const [video] = await db
        .select({
          user: {
            ...getTableColumns(users),
            subscribersCount: db.$count(
              subscribersCount,
              eq(subscribersCount.creatorId, users.id)
            ),
          },
          ...getTableColumns(videos),
          viewCount: db.$count(viewCount, eq(viewCount.videoId, videos.id)),
          likedCount: db.$count(likedCount, eq(likedCount.videoId, videos.id)),
          dislikeCount: db.$count(
            dislikeCount,
            eq(dislikeCount.videoId, videos.id)
          ),
        })
        .from(videos)
        .where(eq(videos.muxPlaybackId, videoPlaybackId))
        .innerJoin(users, eq(videos.userId, users.id));

      if (!video)
        throw new TRPCError({ code: "NOT_FOUND", message: "video not found" });

      return video;
    }),
  create: protectedProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.auth;
      try {
        const upload = await mux.video.uploads.create({
          new_asset_settings: {
            passthrough: userId,
            playback_policies: ["public"],
            inputs: [
              {
                generated_subtitles: [
                  {
                    language_code: "en",
                    name: "English",
                  },
                ],
              },
            ],
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

      if (!video)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });

      if (video.previewKey && video.thumbnailKey) {
        try {
          await utApi.deleteFiles([video.previewKey, video.thumbnailKey]);
        } catch (error) {
          console.error("Error deleting files on uploadthing: ", error);
        }
      }

      if (video.muxAssetId) {
        try {
          await mux.video.assets.delete(video.muxAssetId);
        } catch (error) {
          console.error("Error deleting asset on mux: ", error);
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
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();

      if (!data)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
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

      if (!video)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });

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

  generateThumbnail: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
        prompt: z.string().min(1, { message: "prompt is required" }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const client = new Client({ token: process.env.QSTASH_TOKEN! });

      const { userId } = ctx.auth;

      const { workflowRunId } = await client.trigger({
        url: `http://localhost:3000/api/workflow/thumbnail`,
        retries: 3,
        keepTriggerConfig: true,
        body: { userId, videoId: input.videoId, prompt: input.prompt },
      });

      await db
        .update(videos)
        .set({
          workflowThumbnailStatus: "processing",
        })
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, userId)));

      return workflowRunId;
    }),

  getThumbnailWorkFlow: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { userId } = ctx.auth;
      const [result] = await db
        .select({ status: videos.workflowThumbnailStatus })
        .from(videos)
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, userId)));

      if (!result)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });

      if (!result.status) return;
      return result;
    }),

  generateTitle: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;

      const client = new Client({ token: process.env.QSTASH_TOKEN! });

      const { workflowRunId } = await client.trigger({
        url: `http://localhost:3000/api/workflow/title`,
        retries: 3,
        keepTriggerConfig: true,
        body: { userId, videoId: input.videoId },
      });

      await db
        .update(videos)
        .set({
          workflowTitleStatus: "processing",
        })
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, userId)));

      return workflowRunId;
    }),

  getTitleWorkFlow: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { userId } = ctx.auth;
      const [result] = await db
        .select({ status: videos.workflowTitleStatus })
        .from(videos)
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, userId)));

      if (!result)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong when generate title",
        });

      if (!result.status) return;
      return result;
    }),
  generateDescription: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;

      const client = new Client({ token: process.env.QSTASH_TOKEN! });

      const baseUrl = process.env.WORKFLOW_BASE_URL;
      if (!baseUrl)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Workflow base url is not defined",
        });

      const { workflowRunId } = await client.trigger({
        url: `${baseUrl}/api/workflow/description`,
        retries: 3,
        keepTriggerConfig: true,
        body: { userId, videoId: input.videoId },
      });

      await db
        .update(videos)
        .set({
          workflowDescriptionStatus: "processing",
        })
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, userId)));

      return workflowRunId;
    }),

  getDescriptionWorkFlow: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { userId } = ctx.auth;
      const [result] = await db
        .select({ status: videos.workflowDescriptionStatus })
        .from(videos)
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, userId)));

      if (!result)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong when generate description",
        });

      if (!result.status) return;
      return result;
    }),
});
