import { db } from "@/db";
import {
  dislikeCount,
  likedCount,
  subscribersCount,
  users,
  videos,
  viewCount,
} from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { auth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns, not, or } from "drizzle-orm";
import z from "zod";

export const videoRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(z.object({ videoPlaybackId: z.string() }))
    .query(async ({ input }) => {
      const { videoPlaybackId } = input;

      const { userId: clerkUserId } = await auth();

      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(clerkUserId ? eq(users.clerkId, clerkUserId) : undefined);

      const [video] = await db
        .select({
          user: {
            ...getTableColumns(users),
            subscribersCount: db.$count(
              subscribersCount,
              eq(subscribersCount.creatorId, users.id)
            ),
          },
          ...getTableColumns(videos),
          viewCount: db.$count(viewCount, eq(viewCount.videoId, videos.id)),
          likedCount: db.$count(likedCount, eq(likedCount.videoId, videos.id)),
          dislikeCount: db.$count(
            dislikeCount,
            eq(dislikeCount.videoId, videos.id)
          ),
        })
        .from(videos)
        .where(
          and(
            eq(videos.muxPlaybackId, videoPlaybackId),
            or(eq(videos.visibility, "public"), eq(videos.userId, user.id))
          )
        )
        .innerJoin(users, eq(videos.userId, users.id));

      if (!video)
        throw new TRPCError({ code: "NOT_FOUND", message: "video not found" });

      return video;
    }),

  getSuggestions: baseProcedure
    .input(z.object({ videoPlaybackId: z.string() }))
    .query(async ({ input }) => {
      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(eq(videos.muxPlaybackId, input.videoPlaybackId));

      if (!existingVideo)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "something went wrong",
        });

      const data = await db
        .select({
          ...getTableColumns(videos),
          user: getTableColumns(users),
          count: db.$count(viewCount, eq(viewCount.videoId, videos.id)),
        })
        .from(videos)
        .where(
          and(
            existingVideo.categoryId
              ? eq(videos.categoryId, existingVideo.categoryId)
              : undefined,
            not(eq(videos.id, existingVideo.id)),
            eq(videos.visibility, "public")
          )
        )
        .innerJoin(users, eq(videos.userId, users.id))
      return data;
    }),
});
