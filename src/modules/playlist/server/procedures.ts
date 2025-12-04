import { db } from "@/db";
import {
  playlist,
  playlistUpdateSchema,
  playlistVideos,
  users,
  videos,
  viewCount,
} from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import z from "zod";

export const playlistRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ playlistId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { userId } = ctx.auth;
      const { playlistId } = input;

      if (!playlistId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong",
        });
      }
      const [data] = await db
        .select()
        .from(playlist)
        .where(
          and(
            eq(playlist.id, playlistId),
            or(eq(playlist.visibility, "public"), eq(playlist.userId, userId))
          )
        );
      return data;
    }),
  getMany: protectedProcedure.query(async ({ ctx }) => {
    const { userId, clerkUserId } = ctx.auth;

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
          eq(playlist.userId, userId),
          or(eq(users.clerkId, clerkUserId), eq(playlist.visibility, "public"))
        )
      )
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

      if (!playlistId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong",
        });
      }
      const [data] = await db
        .delete(playlist)
        .where(and(eq(playlist.id, playlistId), eq(playlist.userId, userId)))
        .returning();

      return data;
    }),

  update: protectedProcedure
    .input(playlistUpdateSchema)
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

  getManyVideos: protectedProcedure
    .input(z.object({ playlistId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { playlistId } = input;

      const { userId, clerkUserId } = ctx.auth;

      // Verify user can access this playlist
      const [playlistRecord] = await db
        .select()
        .from(playlist)
        .innerJoin(users, eq(playlist.userId, users.id))
        .where(
          and(
            eq(playlist.userId, userId),
            or(
              eq(users.clerkId, clerkUserId),
              eq(playlist.visibility, "public")
            )
          )
        );

      if (!playlistRecord) {
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
        .where(eq(playlistVideos.playlistId, playlistId))
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
