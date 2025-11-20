import { db } from "@/db";
import { comments, commentsReplies, videos } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import z from "zod";

export const commentsRepliesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ commentId: z.string(), content: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.auth;
      const { commentId, content } = input;

      if (!commentId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Something went wrong",
        });
      }
      if (!content) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "reply cannot be empty",
        });
      }

      const [replies] = await db
        .insert(commentsReplies)
        .values({ userId, commentId, content })
        .returning();

      return replies;
    }),

  getMany: baseProcedure
    .input(z.object({ commentId: z.string() }))
    .query(async ({ input }) => {
      const { commentId } = input;
      if (!commentId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Something went wrong",
        });
      }
      const data = await db
        .select()
        .from(commentsReplies)
        .where(eq(commentsReplies.commentId, commentId));
      return data;
    }),

  totalReplies: baseProcedure
    .input(z.object({ videoPlaybackId: z.string() }))
    .query(async ({ input }) => {
      const { videoPlaybackId } = input;
      if (!videoPlaybackId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Something went wrong",
        });
      }
      const [existingVideo] = await db
        .select({ id: videos.id })
        .from(videos)
        .where(eq(videos.muxPlaybackId, videoPlaybackId));

      if (!existingVideo.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Something went wrong",
        });
      }

      const [existingComment] = await db
        .select({ id: comments.id })
        .from(comments)
        .where(eq(comments.videoId, existingVideo.id));

      if (!existingComment.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Something went wrong",
        });
      }

      const data = await db
        .select()
        .from(commentsReplies)
        .where(eq(commentsReplies.commentId, existingComment.id));

      return data.length;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        commentReplyId: z.string(),
        videoPlaybackId: z.string(),
        commentId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.auth;
      const { commentReplyId, videoPlaybackId, commentId } = input;

      if (!commentReplyId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Something went wrong",
        });
      }

      const [owner] = await db
        .select({
          video: videos.userId,
          comment: comments.userId,
          commentReplies: commentsReplies.userId,
        })
        .from(videos)
        .where(eq(videos.muxPlaybackId, videoPlaybackId))
        .innerJoin(comments, eq(comments.id, commentId))
        .innerJoin(commentsReplies, eq(commentsReplies.id, commentReplyId));

      if (
        owner.comment !== userId &&
        owner.commentReplies !== userId &&
        owner.video !== userId
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this comment",
        });
      }

      const [data] = await db
        .delete(commentsReplies)
        .where(eq(commentsReplies.id, commentReplyId))
        .returning();
      return data;
    }),
});
