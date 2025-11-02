import { db } from "@/db";
import { videos } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, desc, eq, lt, or } from "drizzle-orm";
import z from "zod";

export const studioProcedures = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const data = await db
        .select()
        .from(videos)
        .where(eq(videos.userId, input.userId))
        .orderBy(desc(videos.updatedAt), desc(videos.id));

      return data
    }),
});
