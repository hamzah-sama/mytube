import { db } from "@/db";
import { videos } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";

export const videoRouter = createTRPCRouter({
    
  create: protectedProcedure
    .input(z.object({ title: z.string(), userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const newVideo = await db
        .insert(videos)
        .values({
          title: input.title,
          userId: input.userId,
        })
        .returning();

      return newVideo;
    }),
});
