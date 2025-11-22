import { db } from "@/db";
import { subscriptions, videos } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import z from "zod";

export const subscriptionsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // get viewerId from auth context and videoId from input
      const { userId: viewerId } = ctx.auth;
      const { videoId } = input;

      // get the creatorId of the video
      const [getvideoUserId] = await db
        .select({ creatorId: videos.userId })
        .from(videos)
        .where(eq(videos.id, videoId));

      if (!getvideoUserId)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });

      // prevent users from subscribing to themselves

      if (viewerId === getvideoUserId.creatorId) return;

      // check if a subscription record already exists
      const [existingRecord] = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.viewerId, viewerId),
            eq(subscriptions.creatorId, getvideoUserId.creatorId)
          )
        );

      // if it exists, delete it (unsubscribe)
      if (existingRecord) {
        await db
          .delete(subscriptions)
          .where(
            and(
              eq(subscriptions.creatorId, existingRecord.creatorId),
              eq(subscriptions.viewerId, existingRecord.viewerId)
            )
          );
        return { unsubscribed: true };
      }

      // if it doesn't exist, create a new subscription record
      const [createSubscriber] = await db
        .insert(subscriptions)
        .values({
          creatorId: getvideoUserId.creatorId,
          viewerId,
        })
        .returning();

      return createSubscriber;
    }),

  isSubscribed: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ ctx, input }) => {
      // get viewerId from auth context and videoId from input
      const { userId: viewerId } = ctx.auth;
      const { videoId } = input;

      // get the creatorId of the video
      const [video] = await db
        .select({ creatorId: videos.userId })
        .from(videos)
        .where(eq(videos.id, videoId));

      if (!video)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });

      // check if a subscription record exists
      const [data] = await db
        .select({ count: sql<number>`count(*)` })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.viewerId, viewerId),
            eq(subscriptions.creatorId, video.creatorId)
          )
        );

      // if it exists, return true else false
      return data.count > 0;
    }),
});
