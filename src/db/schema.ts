import { relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  pgEnum,
  primaryKey,
  uniqueIndex,
  foreignKey,
  index,
} from "drizzle-orm/pg-core";

import { createUpdateSchema, createInsertSchema } from "drizzle-zod";
import z from "zod";
import { id } from "zod/v4/locales";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  bannerUrl: text("banner_url"),
  bannerKey: text("banner_key").unique(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const visibility = pgEnum("visibility", ["public", "private"]);
export const workflowStatus = pgEnum("workflow_status", [
  "processing",
  "success",
]);

export const videos = pgTable(
  "videos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    thumbnailKey: text("thumbnail_key").unique(),
    thumbnailUrl: text("thumbnail_url"),
    previewUrl: text("preview_url"),
    previewKey: text("preview_key"),
    duration: integer("duration").notNull().default(0),
    visibility: visibility("visibility").notNull().default("public"),
    muxUploadedId: text("mux_uploaded_id").unique(),
    muxAssetId: text("mux_asset_id").unique(),
    muxStatus: text("mux_status"),
    muxPlaybackId: text("mux_playback_id").unique(),
    muxtrackId: text("mux_track_id").unique(),
    muxTrackStatus: text("mux_track_status"),
    workflowThumbnailStatus: workflowStatus("workflow_thumbnail_status"),
    workflowTitleStatus: workflowStatus("workflow_title_status"),
    workflowDescriptionStatus: workflowStatus("workflow_description_status"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("idx_category_id").on(table.categoryId),
    index("idx_user_id").on(table.userId),
    index("idx_visibility").on(table.visibility),
    index("idx_created_at").on(table.createdAt),
  ]
);

export const videoUpdateSchema = createUpdateSchema(videos);

export const viewCount = pgTable(
  "view_count",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    videoId: uuid("video_id")
      .references(() => videos.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.videoId] }),
    index("idx_video_id_view_count").on(table.videoId),
  ]
);

export const history = pgTable(
  "history",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    videoId: uuid("video_id")
      .references(() => videos.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.videoId] }),
    index("idx_user_id_history").on(table.userId),
  ]
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    creatorId: uuid("creator_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    viewerId: uuid("viewer_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.creatorId, table.viewerId] }),
    index("idx_creator_id").on(table.creatorId),
    index("idx_viewer_id").on(table.viewerId),
  ]
);

export const like = pgTable(
  "like",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    videoId: uuid("video_id")
      .references(() => videos.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.videoId] }),
    index("idx_video_id_like").on(table.videoId),
  ]
);

export const dislike = pgTable(
  "dislike",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    videoId: uuid("video_id")
      .references(() => videos.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.videoId] }),
    index("idx_video_id_dislike").on(table.videoId),
  ]
);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    parentId: uuid("parent_id"),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    videoId: uuid("video_id")
      .references(() => videos.id, { onDelete: "cascade" })
      .notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => {
    return [
      foreignKey({
        columns: [t.parentId],
        foreignColumns: [t.id],
        name: "comments_parent_id_fkey",
      }).onDelete("cascade"),
      index("idx_video_id_comments").on(t.videoId),
      index("idx_parent_id").on(t.parentId),
      index("idx_created_at_comments").on(t.createdAt),
    ];
  }
);

export const commetsRelation = relations(comments, ({ one, many }) => ({
  parent: one(comments, {
    relationName: "comments_parent_id_fkey",
    fields: [comments.parentId],
    references: [comments.id],
  }),
  replies: many(comments, {
    relationName: "comments_parent_id_fkey",
  }),
}));

export const commentInsertSchema = createInsertSchema(comments);

export const commentsLikeCount = pgTable(
  "comments_like_count",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    commentId: uuid("comment_id")
      .references(() => comments.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.commentId] }),
    index("idx_comment_id_like").on(table.commentId),
  ]
);

export const commentsDislikeCount = pgTable(
  "comments_dislike_count",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    commentId: uuid("comment_id")
      .references(() => comments.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.commentId] }),
    index("idx_comment_id_dislike").on(table.commentId),
  ]
);

export const playlist = pgTable("playlists", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  visibility: visibility("visibility").notNull().default("private"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const playlistUpdateSchema = createUpdateSchema(playlist).extend({id: z.string()});


export const playlistVideos = pgTable(
  "playlist_videos",
  {
    playlistId: uuid("playlist_id")
      .notNull()
      .references(() => playlist.id, { onDelete: "cascade" }),
    videoId: uuid("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.playlistId, table.videoId] }),
    index("idx_video_id_playlists").on(table.videoId),
    index("idx_playlist_id").on(table.playlistId),
  ]
);
