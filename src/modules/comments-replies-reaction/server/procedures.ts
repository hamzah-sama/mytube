import { db } from "@/db";
import {
  commentsRepliesDislikeCount,
  commentsRepliesLikeCount,
} from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const CommentsRepliesReactionRouter = createTRPCRouter({
  like: protectedProcedure
    .input(z.object({ commentReplyId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.auth;
      const { commentReplyId } = input;

      await db
        .delete(commentsRepliesDislikeCount)
        .where(
          and(
            eq(commentsRepliesDislikeCount.commentReplyId, commentReplyId),
            eq(commentsRepliesDislikeCount.userId, userId)
          )
        );

      const [existingRecord] = await db
        .select()
        .from(commentsRepliesLikeCount)
        .where(
          and(
            eq(commentsRepliesLikeCount.commentReplyId, commentReplyId),
            eq(commentsRepliesLikeCount.userId, userId)
          )
        );

      if (existingRecord) {
        await db
          .delete(commentsRepliesLikeCount)
          .where(
            and(
              eq(commentsRepliesLikeCount.commentReplyId, commentReplyId),
              eq(commentsRepliesLikeCount.userId, userId)
            )
          );
      } else {
        await db
          .insert(commentsRepliesLikeCount)
          .values({ userId, commentReplyId });
      }
    }),

  dislike: protectedProcedure
    .input(z.object({ commentReplyId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.auth;
      const { commentReplyId } = input;

      await db
        .delete(commentsRepliesLikeCount)
        .where(
          and(
            eq(commentsRepliesLikeCount.commentReplyId, commentReplyId),
            eq(commentsRepliesLikeCount.userId, userId)
          )
        );

      const [existingRecord] = await db
        .select()
        .from(commentsRepliesDislikeCount)
        .where(
          and(
            eq(commentsRepliesDislikeCount.commentReplyId, commentReplyId),
            eq(commentsRepliesDislikeCount.userId, userId)
          )
        );

      if (existingRecord) {
        await db
          .delete(commentsRepliesDislikeCount)
          .where(
            and(
              eq(commentsRepliesDislikeCount.commentReplyId, commentReplyId),
              eq(commentsRepliesDislikeCount.userId, userId)
            )
          );
      } else {
        await db
          .insert(commentsRepliesDislikeCount)
          .values({ userId, commentReplyId });
      }
    }),

  isLike: protectedProcedure
    .input(z.object({ commentReplyId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { commentReplyId } = input;
      const { userId } = ctx.auth;

      const [data] = await db
        .select()
        .from(commentsRepliesLikeCount)
        .where(
          and(
            eq(commentsRepliesLikeCount.commentReplyId, commentReplyId),
            eq(commentsRepliesLikeCount.userId, userId)
          )
        );

      return !!data;
    }),

  isDislike: protectedProcedure
    .input(z.object({ commentReplyId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { commentReplyId } = input;
      const { userId } = ctx.auth;

      const [data] = await db
        .select()
        .from(commentsRepliesDislikeCount)
        .where(
          and(
            eq(commentsRepliesDislikeCount.commentReplyId, commentReplyId),
            eq(commentsRepliesDislikeCount.userId, userId)
          )
        );

      return !!data;
    }),
});
