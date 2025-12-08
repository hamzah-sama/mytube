import { db } from "@/db";
import {
  playlist,
  playlistVideos,
  subscriptions,
  users,
  videos,
  viewCount,
} from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { auth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import z from "zod";

export const userRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      // get videoPlaybackId from input
      const { userId } = input;

      // fetch the video with additional user and count info and allow access to private videos if the authenticated user is the owner
      const [user] = await db
        .select({
          ...getTableColumns(users),
          totalVideos: db.$count(videos, eq(videos.userId, users.id)),
          subscribersCount: db.$count(
            subscriptions,
            eq(subscriptions.creatorId, users.id)
          ),
        })
        .from(users)
        .where(eq(users.id, userId));

      if (!user)
        throw new TRPCError({ code: "NOT_FOUND", message: "user not found" });

      return user;
    }),

  subscribe: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // get viewerId from auth context and videoId from input
      const { userId: viewerId } = ctx.auth;
      const { userId: creatorId } = input;

      // prevent users from subscribing to themselves

      if (viewerId === creatorId) return;

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

  getManyVideos: baseProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const { userId } = input;

      let ownerId: string | null = null;
      // get authenticated user's clerk id
      const { userId: clerkUserId } = await auth();

      // get authenticated user's id from db if clerk id exists and assign it to ownerId variable
      if (clerkUserId) {
        const [user] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.clerkId, clerkUserId));
        ownerId = user?.id;
      }
      const data = await db
        .select({
          ...getTableColumns(videos),
          user: getTableColumns(users),
          count: db.$count(viewCount, eq(viewCount.videoId, videos.id)),
        })
        .from(videos)
        .where(
          and(
            or(
              eq(videos.visibility, "public"),
              ownerId === userId ? sql`true` : sql`false`
            ),
            eq(videos.userId, userId)
          )
        )
        .innerJoin(users, eq(videos.userId, users.id))
        .orderBy(desc(videos.createdAt), desc(videos.id));

      return data;
    }),
  getManyPlaylist: baseProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const { userId } = input;

      let ownerId: string | null = null;
      // get authenticated user's clerk id
      const { userId: clerkUserId } = await auth();

      // get authenticated user's id from db if clerk id exists and assign it to ownerId variable
      if (clerkUserId) {
        const [user] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.clerkId, clerkUserId));
        ownerId = user?.id;
      }

      const pv = alias(playlistVideos, "pv");
      const v = alias(videos, "v");
      const thumbnail = db.$with("thumbnails").as(
        db
          .select({
            playlistId: pv.playlistId,
            image: v.thumbnailUrl,
            rn: sql<number>`row_number() over (
            partition by ${pv.playlistId}
            order by ${pv.createdAt}
          )`.as("rn"),
          })
          .from(pv)
          .innerJoin(v, eq(v.id, pv.videoId))
      );

      const data = await db
        .with(thumbnail)
        .select({
          ...getTableColumns(playlist),
          videosCount: db.$count(
            playlistVideos,
            eq(playlistVideos.playlistId, playlist.id)
          ),
          thumbnailUrl: thumbnail.image,
        })
        .from(playlist)
        .where(
          and(
            or(
              eq(playlist.visibility, "public"),
              ownerId === userId ? sql`true` : sql`false`
            ),
            eq(playlist.userId, userId)
          )
        )
        .innerJoin(users, eq(playlist.userId, users.id))
        .leftJoin(
          thumbnail,
          and(eq(thumbnail.playlistId, playlist.id), eq(thumbnail.rn, 1))
        );
      return data;
    }),
});
