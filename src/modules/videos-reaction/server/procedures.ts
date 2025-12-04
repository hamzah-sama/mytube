import { db } from "@/db";
import { dislike, like } from "@/db/schema";
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
        .from(like)
        .where(and(eq(like.videoId, videoId), eq(like.userId, userId)));

      await db
        .delete(dislike)
        .where(and(eq(dislike.videoId, videoId), eq(dislike.userId, userId)));

      if (existingRecord) {
        await db
          .delete(like)
          .where(
            and(
              eq(like.videoId, existingRecord.videoId),
              eq(like.userId, existingRecord.userId)
            )
          );
      } else {
        await db.insert(like).values({ videoId, userId }).returning();
      }
    }),

  disliked: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.auth;
      const { videoId } = input;

      const [existingRecord] = await db
        .select()
        .from(dislike)
        .where(and(eq(dislike.videoId, videoId), eq(dislike.userId, userId)));

      await db
        .delete(like)
        .where(and(eq(like.videoId, videoId), eq(like.userId, userId)));

      if (existingRecord) {
        await db
          .delete(dislike)
          .where(
            and(
              eq(dislike.videoId, existingRecord.videoId),
              eq(dislike.userId, existingRecord.userId)
            )
          );
      } else {
        await db.insert(dislike).values({ videoId, userId }).returning();
      }
    }),

  isLiked: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { videoId } = input;
      const { userId } = ctx.auth;

      const [data] = await db
        .select()
        .from(like)
        .where(and(eq(like.videoId, videoId), eq(like.userId, userId)));

      return !!data;
    }),
  isDisliked: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { videoId } = input;
      const { userId } = ctx.auth;

      const [data] = await db
        .select()
        .from(dislike)
        .where(and(eq(dislike.videoId, videoId), eq(dislike.userId, userId)));

      return !!data;
    }),
});
