import { db } from "@/db";
import { videos } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import {  desc, eq } from "drizzle-orm";

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
});
