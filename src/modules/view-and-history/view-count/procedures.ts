import { db } from "@/db";
import { viewCount } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const ViewCountRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.auth;
      const { videoId } = input;

      const [existingRecord] = await db
        .select()
        .from(viewCount)
        .where(
          and(eq(viewCount.videoId, videoId), eq(viewCount.userId, userId))
        );

      if (existingRecord) return existingRecord;

      const [createdViewCount] = await db
        .insert(viewCount)
        .values({ videoId, userId })
        .returning();

      return createdViewCount;
    }),
});
