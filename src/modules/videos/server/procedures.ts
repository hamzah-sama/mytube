import { db } from "@/db";
import {
  comments,
  subscriptions,
  users,
  videos,
  viewCount,
  like,
  dislike,
  history,
} from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { auth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import {
  and,
  desc,
  eq,
  getTableColumns,
  ilike,
  inArray,
  not,
  or,
  sql,
} from "drizzle-orm";
import z from "zod";

export const videoRouter = createTRPCRouter({
  // get all videos to display on home feed with category filter
  getMany: baseProcedure
    .input(z.object({ categoryId: z.string().nullish() }))
    .query(async ({ input }) => {
      const { categoryId } = input;
      const data = await db
        .select({
          ...getTableColumns(videos),
          user: getTableColumns(users),
          count: db.$count(viewCount, eq(viewCount.videoId, videos.id)),
        })
        .from(videos)
        .where(
          and(
            eq(videos.visibility, "public"),
            categoryId ? eq(videos.categoryId, categoryId) : sql`true`
          )
        )
        .innerJoin(users, eq(videos.userId, users.id))
        .orderBy(desc(videos.createdAt), desc(videos.id));
      return data;
    }),

  search: baseProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const { query } = input;

      const data = await db
        .select({
          ...getTableColumns(videos),
          user: getTableColumns(users),
          count: db.$count(viewCount, eq(viewCount.videoId, videos.id)),
        })
        .from(videos)
        .where(
          or(
            ilike(videos.title, `%${query}%`),
            ilike(videos.description, `%${query}%`),
            ilike(users.name, `%${query}%`)
          )
        )
        .innerJoin(users, eq(videos.userId, users.id));
      return data;
    }),

  // get specific video
  getOne: baseProcedure
    .input(z.object({ videoPlaybackId: z.string() }))
    .query(async ({ input }) => {
      // get videoPlaybackId from input
      const { videoPlaybackId } = input;

      // create userId variable to store authenticated user's id to allow the owner videos access their private videos
      let userId: string | null = null;
      // get authenticated user's clerk id
      const { userId: clerkUserId } = await auth();

      // get authenticated user's id from db if clerk id exists and assign it to userId variable
      if (clerkUserId) {
        const [user] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.clerkId, clerkUserId));
        userId = user?.id;
      }

      // fetch the video with additional user and count info and allow access to private videos if the authenticated user is the owner
      const [video] = await db
        .select({
          user: {
            ...getTableColumns(users),
            subscribersCount: db.$count(
              subscriptions,
              eq(subscriptions.creatorId, users.id)
            ),
          },
          ...getTableColumns(videos),
          viewCount: db.$count(viewCount, eq(viewCount.videoId, videos.id)),
          likedCount: db.$count(like, eq(like.videoId, videos.id)),
          dislikeCount: db.$count(dislike, eq(dislike.videoId, videos.id)),
        })
        .from(videos)
        .where(
          and(
            eq(videos.muxPlaybackId, videoPlaybackId),
            or(
              eq(videos.visibility, "public"),
              userId ? eq(videos.userId, userId) : sql`false`
            )
          )
        )
        .innerJoin(users, eq(videos.userId, users.id));

      if (!video)
        throw new TRPCError({ code: "NOT_FOUND", message: "video not found" });

      return video;
    }),

  // get suggested videos by category
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
              : sql`true`,
            not(eq(videos.id, existingVideo.id)),
            eq(videos.visibility, "public")
          )
        )
        .innerJoin(users, eq(videos.userId, users.id));
      return data;
    }),

  // get 50 trending videos based on views, likes, comments and time since upload
  getTrending: baseProcedure.query(async () => {
    const data = await db
      .select({
        ...getTableColumns(videos),
        user: getTableColumns(users),
        count: db.$count(viewCount, eq(viewCount.videoId, videos.id)),
      })
      .from(videos)
      .where(eq(videos.visibility, "public"))
      .innerJoin(users, eq(videos.userId, users.id))
      .orderBy(
        desc(sql`(
          (COALESCE(${db.$count(
            viewCount,
            eq(viewCount.videoId, videos.id)
          )}, 0) * 0.6) +
          (COALESCE(${db.$count(like, eq(like.videoId, videos.id))}, 0) * 0.3) +
          (COALESCE(${db.$count(
            comments,
            eq(comments.videoId, videos.id)
          )}, 0) * 0.1)
        ) / POWER(EXTRACT(EPOCH FROM NOW() - ${
          videos.createdAt
        }) / 3600 + 2, 1.2)`)
      )
      .limit(50);
    return data;
  }),

  getLikedVideos: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.auth;

    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
    // get all liked videos of the authenticated user
    const likedVideos = await db
      .select({ videoId: like.videoId })
      .from(like)
      .where(eq(like.userId, userId));

    // get the videoIds of the liked videos
    const videoIds = likedVideos.map((video) => video.videoId);

    // if the user has not liked any videos, return an empty array
    if (videoIds.length === 0) return [];

    // fetch all videos with additional user and count info from the liked videos with ordering by most recently liked
    const data = await db
      .select({
        ...getTableColumns(videos),
        user: getTableColumns(users),
        count: db.$count(viewCount, eq(viewCount.videoId, videos.id)),
      })
      .from(videos)
      .where(and(eq(videos.visibility, "public"), inArray(videos.id, videoIds)))
      .innerJoin(users, eq(videos.userId, users.id))
      .innerJoin(
        like,
        and(eq(like.videoId, videos.id), eq(like.userId, userId))
      )
      .orderBy(desc(like.createdAt), desc(videos.id));

    return data;
  }),

  getHistory: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.auth;
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    // get all history of the authenticated user
    const historyVideo = await db
      .select()
      .from(history)
      .where(eq(history.userId, userId));

    const videoIds = historyVideo.map((video) => video.videoId);
    // if the user has not watched any videos, return an empty array
    if (videoIds.length === 0) return [];

    // fetch all videos with additional user and count info
    const data = await db
      .select({
        ...getTableColumns(videos),
        user: getTableColumns(users),
        count: db.$count(viewCount, eq(viewCount.videoId, videos.id)),
        historyCreatedDate: history.createdAt,
      })
      .from(videos)
      .where(and(eq(videos.visibility, "public"), inArray(videos.id, videoIds)))
      .innerJoin(users, eq(videos.userId, users.id))
      .innerJoin(
        history,
        and(eq(history.userId, userId), eq(history.videoId, videos.id))
      )
      .orderBy(desc(history.createdAt), desc(videos.id));
    return data;
  }),
});