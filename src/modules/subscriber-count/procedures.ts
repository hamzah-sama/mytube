import { db } from "@/db";
import { subscribersCount, videos } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq, sql } from "drizzle-orm";
import z from "zod";

export const subscribersCountRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId: viewerId } = ctx.auth;
      const { videoId } = input;

      const [getvideoUserId] = await db
        .select({ creatorId: videos.userId })
        .from(videos)
        .where(eq(videos.id, videoId));

      if (viewerId === getvideoUserId.creatorId) return;

      const [existingRecord] = await db
        .select()
        .from(subscribersCount)
        .where(
          and(
            eq(subscribersCount.viewerId, viewerId),
            eq(subscribersCount.creatorId, getvideoUserId.creatorId)
          )
        );

      if (existingRecord) {
        await db
          .delete(subscribersCount)
          .where(
            and(
              eq(subscribersCount.creatorId, existingRecord.creatorId),
              eq(subscribersCount.viewerId, existingRecord.viewerId)
            )
          );
        return { unsubscribed: true };
      }

      const [createSubscriber] = await db
        .insert(subscribersCount)
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
      const { userId: viewerId } = ctx.auth;
      const { videoId } = input;

      const [video] = await db
        .select({ creatorId: videos.userId })
        .from(videos)
        .where(eq(videos.id, videoId));
        
      const [data] = await db
        .select({ count: sql<number>`count(*)` })
        .from(subscribersCount)
        .where(
          and(
            eq(subscribersCount.viewerId, viewerId),
            eq(subscribersCount.creatorId, video.creatorId)
          )
        );

      return data.count > 0;
    }),
});
