import { db } from "@/db";
import { subscriptions, users, videos, viewCount } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, inArray, sql } from "drizzle-orm";
import z from "zod";

export const subscriptionsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z
        .object({
          videoId: z.string().optional(),
          userId: z.string().optional(),
        })
        .refine(
          (val) => (val.videoId && !val.userId) || (!val.videoId && val.userId)
        )
    )
    .mutation(async ({ ctx, input }) => {
      // get viewerId from auth context and videoId from input
      const { userId: viewerId } = ctx.auth;
      const { videoId, userId } = input;

      let creatorId = "";

      if (videoId) {
        // prevent users from subscribing to themselves}

        // get the creatorId of the video
        const [getvideoUserId] = await db
          .select({ creatorId: videos.userId })
          .from(videos)
          .where(eq(videos.id, videoId));

        if (!getvideoUserId)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Video not found",
          });

        creatorId = getvideoUserId.creatorId;
      }
      if (userId) {
        creatorId = userId;
      }

      // prevent users from subscribing to themselves
      if (viewerId === creatorId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot subscribe to yourself",
        });
      }
      // check if a subscription record already exists
      const [existingRecord] = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.viewerId, viewerId),
            eq(subscriptions.creatorId, creatorId)
          )
        );

      // if it exists, delete it (unsubscribe)
      if (existingRecord) {
        await db
          .delete(subscriptions)
          .where(
            and(
              eq(subscriptions.creatorId, existingRecord.creatorId),
              eq(subscriptions.viewerId, existingRecord.viewerId)
            )
          );
        return { unsubscribed: true };
      }

      // if it doesn't exist, create a new subscription record
      const [createSubscriber] = await db
        .insert(subscriptions)
        .values({
          creatorId,
          viewerId,
        })
        .returning();

      return createSubscriber;
    }),

  isSubscribed: protectedProcedure
    .input(
      z
        .object({
          videoId: z.string().optional(),
          userId: z.string().optional(),
        })
        .refine(
          (val) => (val.videoId && !val.userId) || (!val.videoId && val.userId)
        )
    )
    .query(async ({ ctx, input }) => {
      // get viewerId from auth context and videoId from input
      const { userId: viewerId } = ctx.auth;
      const { videoId, userId } = input;

      let creatorId = "";

      if (videoId) {
        const [video] = await db
          .select({ creatorId: videos.userId })
          .from(videos)
          .where(eq(videos.id, videoId));

        if (!video)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Video not found",
          });
        creatorId = video.creatorId;
      }
      if (userId) {
        creatorId = userId;
      }

      // check if a subscription record exists
      const [data] = await db
        .select({ count: sql<number>`count(*)` })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.viewerId, viewerId),
            eq(subscriptions.creatorId, creatorId)
          )
        );

      // if it exists, return true else false
      return data.count > 0;
    }),

  // get all videos that the authenticated user is subscribed to
  getVideos: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.auth;
    // get all subscriptions of the authenticated user
    const getSubscriptions = await db
      .select({ creatorId: subscriptions.creatorId })
      .from(subscriptions)
      .where(eq(subscriptions.viewerId, userId));

    // get the creatorIds of the subscriptions
    const subscriptionCreatorIds = getSubscriptions.map((sub) => sub.creatorId);

    // if the user is not subscribed to any creators, return an empty array
    if (subscriptionCreatorIds.length === 0) return [];

    // fetch all videos with additional user and count info from the subscribed creators
    const data = await db
      .select({
        ...getTableColumns(videos),
        user: getTableColumns(users),
        count: db.$count(viewCount, eq(viewCount.videoId, videos.id)),
      })
      .from(videos)
      .where(
        and(
          inArray(videos.userId, subscriptionCreatorIds),
          eq(videos.visibility, "public")
        )
      )
      .innerJoin(users, eq(videos.userId, users.id))
      .orderBy(desc(videos.createdAt), desc(videos.id));

    return data;
  }),

  getCreators: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.auth;
    // get all subscriptions of the authenticated user
    const getSubscriptions = await db
      .select({ creatorId: subscriptions.creatorId })
      .from(subscriptions)
      .where(eq(subscriptions.viewerId, userId));

    // get the creatorIds of the subscriptions
    const subscriptionCreatorIds = getSubscriptions.map((sub) => sub.creatorId);

    // if the user is not subscribed to any creators, return an empty array
    if (subscriptionCreatorIds.length === 0) return [];

    // fetch creators the user is subscribed to (limited at 5)
    const data = await db
      .select()
      .from(users)
      .where(inArray(users.id, subscriptionCreatorIds))
      .limit(5);

    return data;
  }),
});
