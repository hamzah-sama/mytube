import { db } from "@/db";
import {
  playlist,
  playlistUpdateSchema,
  playlistVideos,
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

export const playlistRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(z.object({ playlistId: z.string() }))
    .query(async ({ input }) => {
      const { playlistId } = input;
      const { userId: clerkUserId } = await auth();

      const [existingPlaylist] = await db
        .select({
          id: playlist.id,
          name: playlist.name,
          visibility: playlist.visibility,
          ownerClerkId: users.clerkId,
        })
        .from(playlist)
        .innerJoin(users, eq(users.id, playlist.userId))
        .where(eq(playlist.id, playlistId));

      if (
        existingPlaylist.visibility === "private" &&
        existingPlaylist.ownerClerkId !== clerkUserId
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found or access denied",
        });
      }

      return existingPlaylist;
    }),
  getMany: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.auth;

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
      .where(eq(playlist.userId, userId))
      .innerJoin(users, eq(playlist.userId, users.id))
      .leftJoin(
        thumbnail,
        and(eq(thumbnail.playlistId, playlist.id), eq(thumbnail.rn, 1))
      );
    return data;
  }),

  create: protectedProcedure
    .input(
      z.object({ name: z.string(), visibility: z.enum(["public", "private"]) })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      const { name, visibility } = input;
      const [existingRecord] = await db
        .select()
        .from(playlist)
        .where(and(eq(playlist.name, name), eq(playlist.userId, userId)));

      if (existingRecord) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Playlist already exists",
        });
      }

      const [data] = await db
        .insert(playlist)
        .values({ name, userId, visibility })
        .returning();

      return data;
    }),

  delete: protectedProcedure
    .input(z.object({ playlistId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      const { playlistId } = input;

      const [data] = await db
        .delete(playlist)
        .where(and(eq(playlist.id, playlistId), eq(playlist.userId, userId)))
        .returning();

      if (!data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found or access denied",
        });
      }

      return data;
    }),

  update: protectedProcedure
    .input(playlistUpdateSchema.extend({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;

      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong",
        });
      }

      const [data] = await db
        .update(playlist)
        .set({
          name: input.name,
          visibility: input.visibility,
        })
        .where(and(eq(playlist.id, input.id), eq(playlist.userId, userId)))
        .returning();

      return data;
    }),

  getManyVideos: baseProcedure
    .input(z.object({ playlistId: z.string() }))
    .query(async ({ input }) => {
      const { playlistId } = input;

      let ownerId: string | null = null;
      let ownerClerkId: string | null = null;
      const { userId: clerkUserId } = await auth();

      // get authenticated user's id from db if clerk id exists and assign it to ownerId variable
      if (clerkUserId) {
        const [user] = await db
          .select({ id: users.id, clerkId: users.clerkId })
          .from(users)
          .where(eq(users.clerkId, clerkUserId));
        ownerId = user?.id;
        ownerClerkId = user?.clerkId;
      }

      const [existingPlaylist] = await db
        .select({ visibility: playlist.visibility })
        .from(playlist)
        .where(eq(playlist.id, playlistId));

      if (
        clerkUserId !== ownerClerkId &&
        existingPlaylist.visibility === "private"
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found or access denied",
        });
      }

      const data = await db
        .select({
          ...getTableColumns(videos),
          user: getTableColumns(users),
          count: db.$count(viewCount, eq(viewCount.videoId, videos.id)),
        })
        .from(playlistVideos)
        .innerJoin(videos, eq(playlistVideos.videoId, videos.id))
        .innerJoin(users, eq(videos.userId, users.id))
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            ownerId
              ? eq(videos.userId, ownerId)
              : eq(videos.visibility, "public")
          )
        )
        .orderBy(desc(playlistVideos.createdAt));

      return data;
    }),

  addVideo: protectedProcedure
    .input(z.object({ videoId: z.string(), playlistId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.auth;
      const { videoId, playlistId } = input;
      if (!videoId || !playlistId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong",
        });
      }

      // verify playlist belongs to user
      const [playlistRecord] = await db
        .select()
        .from(playlist)
        .where(and(eq(playlist.id, playlistId), eq(playlist.userId, userId)));

      if (!playlistRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found",
        });
      }

      // verify playlist exists
      const [existingRecord] = await db
        .select()
        .from(playlistVideos)
        .where(
          and(
            eq(playlistVideos.videoId, videoId),
            eq(playlistVideos.playlistId, playlistId)
          )
        );

      if (existingRecord) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "video already exists in playlist",
        });
      }

      const [data] = await db
        .insert(playlistVideos)
        .values({ videoId, playlistId })
        .returning();

      return data;
    }),

  deleteVideo: protectedProcedure
    .input(z.object({ videoId: z.string(), playlistId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { videoId, playlistId } = input;
      const { userId } = ctx.auth;

      if (!videoId || !playlistId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong",
        });
      }

      // verify playlist belongs to user
      const [existingRecord] = await db
        .select()
        .from(playlist)
        .where(and(eq(playlist.id, playlistId), eq(playlist.userId, userId)));

      if (!existingRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found",
        });
      }

      const [data] = await db
        .delete(playlistVideos)
        .where(
          and(
            eq(playlistVideos.videoId, videoId),
            eq(playlistVideos.playlistId, playlistId)
          )
        )
        .returning();

      if (!data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found in playlist",
        });
      }

      return data;
    }),
});
