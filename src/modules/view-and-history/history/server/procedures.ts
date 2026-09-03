import { db } from "@/db";
import { history } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const historyRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { videoId } = input;
      const { userId } = ctx.auth;

      // check if the video is already in the history
      const [existingRecord] = await db
        .select()
        .from(history)
        .where(and(eq(history.videoId, videoId), eq(history.userId, userId)));

        // if the video is already in the history, return the existing record
      if (existingRecord)  return existingRecord;

      // if the video is not in the history, create a new history record
      const [createdHistory] = await db
        .insert(history)
        .values({ videoId, userId })
        .returning();

      return createdHistory;
    }),

  delete: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { videoId } = input;
      const { userId } = ctx.auth;

      const [deletedHistory] = await db
        .delete(history)
        .where(and(eq(history.videoId, videoId), eq(history.userId, userId)))
        .returning();

      return deletedHistory
    }),
});
