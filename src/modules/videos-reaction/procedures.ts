import { db } from "@/db";
import { dislikeCount, likedCount } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq, sql } from "drizzle-orm";
import z from "zod";

export const reactionRouter = createTRPCRouter({
  liked: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.auth;
      const { videoId } = input;

      const [existingRecord] = await db
        .select()
        .from(likedCount)
        .where(
          and(eq(likedCount.videoId, videoId), eq(likedCount.userId, userId))
        );

      await db
        .delete(dislikeCount)
        .where(
          and(
            eq(dislikeCount.videoId, videoId),
            eq(dislikeCount.userId, userId)
          )
        );

      if (existingRecord) {
        await db
          .delete(likedCount)
          .where(
            and(
              eq(likedCount.videoId, existingRecord.videoId),
              eq(likedCount.userId, existingRecord.userId)
            )
          );
      } else {
        await db.insert(likedCount).values({ videoId, userId }).returning();
      }
    }),

  disliked: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.auth;
      const { videoId } = input;

      const [existingRecord] = await db
        .select()
        .from(dislikeCount)
        .where(
          and(
            eq(dislikeCount.videoId, videoId),
            eq(dislikeCount.userId, userId)
          )
        );

      await db
        .delete(likedCount)
        .where(
          and(eq(likedCount.videoId, videoId), eq(likedCount.userId, userId))
        );

      if (existingRecord) {
        await db
          .delete(dislikeCount)
          .where(
            and(
              eq(dislikeCount.videoId, existingRecord.videoId),
              eq(dislikeCount.userId, existingRecord.userId)
            )
          );
      } else {
        await db.insert(dislikeCount).values({ videoId, userId }).returning();
      }
    }),

  isLiked: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { videoId } = input;
      const { userId } = ctx.auth;

      const [data] = await db
        .select()
        .from(likedCount)
        .where(
          and(eq(likedCount.videoId, videoId), eq(likedCount.userId, userId))
        );

      return !!data;
    }),
  isDisliked: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { videoId } = input;
      const { userId } = ctx.auth;

      const [data] = await db
        .select()
        .from(dislikeCount)
        .where(
          and(
            eq(dislikeCount.videoId, videoId),
            eq(dislikeCount.userId, userId)
          )
        );

      return !!data;
    }),
});
