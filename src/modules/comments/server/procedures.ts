import { db } from "@/db";
import {
  comments,
  commentsDislikeCount,
  commentsLikeCount,
  users,
  videos,
} from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  isNotNull,
  isNull,
} from "drizzle-orm";
import z from "zod";

export const commentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        videoPlaybackId: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      const { videoPlaybackId, content } = input;

      if (!videoPlaybackId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong",
        });
      }

      const [video] = await db
        .select({ id: videos.id })
        .from(videos)
        .where(eq(videos.muxPlaybackId, videoPlaybackId));

      if (!video.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong",
        });
      }

      if (!content) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "comment cannot be empty",
        });
      }

      const [data] = await db
        .insert(comments)
        .values({ videoId: video.id, userId, content })
        .returning();
      return data;
    }),

  addReply: protectedProcedure
    .input(
      z.object({
        commentId: z.string(),
        content: z.string().trim().min(1, { message: "Reply cannot be empty" }),
        videoPlaybackId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      const { commentId, content, videoPlaybackId } = input;

      if (!videoPlaybackId || !commentId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong",
        });
      }

      const [video] = await db
        .select({ id: videos.id })
        .from(videos)
        .where(eq(videos.muxPlaybackId, videoPlaybackId));

      if (!video.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong",
        });
      }

      if (!content) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "reply cannot be empty",
        });
      }
      const [data] = await db
        .insert(comments)
        .values({ parentId: commentId, videoId: video.id, userId, content })
        .returning();
      return data;
    }),

  getMany: baseProcedure
    .input(
      z.object({ videoPlaybackId: z.string(), parentId: z.string().nullish() })
    )
    .query(async ({ input }) => {
      const { videoPlaybackId, parentId } = input;

      if (!videoPlaybackId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong",
        });
      }

      const [video] = await db
        .select({ id: videos.id })
        .from(videos)
        .where(eq(videos.muxPlaybackId, videoPlaybackId));

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }
      const getReplies = await db
        .select({
          ...getTableColumns(comments),
          user: { ...getTableColumns(users) },
          likedCount: db.$count(
            commentsLikeCount,
            eq(commentsLikeCount.commentId, comments.id)
          ),
          dislikeCount: db.$count(
            commentsDislikeCount,
            eq(commentsDislikeCount.commentId, comments.id)
          ),
        })
        .from(comments)
        .where(
          and(eq(comments.videoId, video.id), isNotNull(comments.parentId))
        )
        .innerJoin(users, eq(comments.userId, users.id))
        .orderBy(desc(comments.createdAt));

      const getComments = await db
        .select({
          ...getTableColumns(comments),
          user: { ...getTableColumns(users) },
          likedCount: db.$count(
            commentsLikeCount,
            eq(commentsLikeCount.commentId, comments.id)
          ),
          dislikeCount: db.$count(
            commentsDislikeCount,
            eq(commentsDislikeCount.commentId, comments.id)
          ),
        })
        .from(comments)
        .where(and(eq(comments.videoId, video.id), isNull(comments.parentId)))
        .innerJoin(users, eq(comments.userId, users.id))
        .orderBy(desc(comments.createdAt));

      const getCommentswithReplies = getComments.map((comment) => ({
        replies: getReplies.filter((reply) => reply.parentId === comment.id),
      }));
      return { getComments, getReplies, getCommentswithReplies };
    }),

  deleteComment: protectedProcedure
    .input(z.object({ commentId: z.string(), videoPlaybackId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.auth;
      const { commentId, videoPlaybackId } = input;

      if (!commentId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Something went wrong",
        });
      }

      const [owner] = await db
        .select({ video: videos.userId, comment: comments.userId })
        .from(videos)
        .where(eq(videos.muxPlaybackId, videoPlaybackId))
        .innerJoin(comments, eq(comments.id, commentId));

      if (!owner) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment or video not found",
        });
      }

      if (owner.video !== userId && owner.comment !== userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this comment",
        });
      }

      const [data] = await db
        .delete(comments)
        .where(eq(comments.id, commentId))
        .returning();
      return data;
    }),
  getVideoOwner: protectedProcedure
    .input(z.object({ videoPlaybackId: z.string() }))
    .query(async ({ input }) => {
      const { videoPlaybackId } = input;

      const [video] = await db
        .select({ clerkId: users.clerkId })
        .from(videos)
        .where(eq(videos.muxPlaybackId, videoPlaybackId))
        .innerJoin(users, eq(users.id, videos.userId));

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      return video;
    }),
});
