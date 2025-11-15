import { db } from "@/db";
import { dislikeCount, likedCount } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
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

      const [existingRecordDislike] = await db
        .select()
        .from(dislikeCount)
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
      } else if (existingRecordDislike) {
        await db
          .delete(dislikeCount)
          .where(
            and(
              eq(dislikeCount.videoId, existingRecordDislike.videoId),
              eq(dislikeCount.userId, existingRecordDislike.userId)
            )
          );

        await db.insert(likedCount).values({ videoId, userId }).returning();
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

      const [existingRecordLike] = await db
        .select()
        .from(likedCount)
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
      } else if (existingRecordLike) {
        await db
          .delete(likedCount)
          .where(
            and(
              eq(likedCount.videoId, existingRecordLike.videoId),
              eq(likedCount.userId, existingRecordLike.userId)
            )
          );

        await db.insert(dislikeCount).values({ videoId, userId }).returning();
      } else {
        await db.insert(dislikeCount).values({ videoId, userId }).returning();
      }
    }),
});
