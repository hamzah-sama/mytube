import { db } from "@/db";
import { videos } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import z from "zod";

export const studioProcedures = createTRPCRouter({
  getMany: protectedProcedure.query(async ({ input, ctx }) => {
    const { userId } = ctx.auth;

    const data = await db
      .select()
      .from(videos)
      .where(eq(videos.userId, userId))
      .orderBy(desc(videos.updatedAt), desc(videos.id));

    return data;
  }),

  getOne: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { userId } = ctx.auth;
      if (!userId)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "you must be logged in",
        });
      const { videoId } = input;
      if (!videoId)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "VideoId is required",
        });
      const [data] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.userId, userId), eq(videos.id, videoId)));

      if (!data) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
      }
      return data;
    }),
});
