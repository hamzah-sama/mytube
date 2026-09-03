import { db } from "@/db";
import { commentsDislikeCount, commentsLikeCount } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const commentsReactionRouter = createTRPCRouter({
  like: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.auth;
      const { commentId } = input;

      await db
        .delete(commentsDislikeCount)
        .where(
          and(
            eq(commentsDislikeCount.commentId, commentId),
            eq(commentsDislikeCount.userId, userId)
          )
        );

      const [existingRecord] = await db
        .select()
        .from(commentsLikeCount)
        .where(
          and(
            eq(commentsLikeCount.commentId, commentId),
            eq(commentsLikeCount.userId, userId)
          )
        );

      if (existingRecord) {
        await db
          .delete(commentsLikeCount)
          .where(
            and(
              eq(commentsLikeCount.commentId, existingRecord.commentId),
              eq(commentsLikeCount.userId, existingRecord.userId)
            )
          );
      } else {
        await db
          .insert(commentsLikeCount)
          .values({ userId, commentId })
          .returning();
      }
    }),

  dislike: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.auth;
      const { commentId } = input;

      await db
        .delete(commentsLikeCount)
        .where(
          and(
            eq(commentsLikeCount.commentId, commentId),
            eq(commentsLikeCount.userId, userId)
          )
        );

      const [existingRecord] = await db
        .select()
        .from(commentsDislikeCount)
        .where(
          and(
            eq(commentsDislikeCount.commentId, commentId),
            eq(commentsDislikeCount.userId, userId)
          )
        );

      if (existingRecord) {
        await db
          .delete(commentsDislikeCount)
          .where(
            and(
              eq(commentsDislikeCount.commentId, existingRecord.commentId),
              eq(commentsDislikeCount.userId, existingRecord.userId)
            )
          );
      } else {
        await db
          .insert(commentsDislikeCount)
          .values({ userId, commentId })
          .returning();
      }
    }),

  isLiked: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { commentId } = input;
      const { userId } = ctx.auth;

      const [data] = await db
        .select()
        .from(commentsLikeCount)
        .where(
          and(
            eq(commentsLikeCount.commentId, commentId),
            eq(commentsLikeCount.userId, userId)
          )
        );

      return !!data;
    }),

  isDisliked: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { commentId } = input;
      const { userId } = ctx.auth;

      const [data] = await db
        .select()
        .from(commentsDislikeCount)
        .where(
          and(
            eq(commentsDislikeCount.commentId, commentId),
            eq(commentsDislikeCount.userId, userId)
          )
        );

      return !!data;
    }),
});
