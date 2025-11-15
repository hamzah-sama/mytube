import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";

import { createUpdateSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
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

export const visibilityVideos = pgEnum("visibility_videos", [
  "public",
  "private",
]);
export const workflowStatus = pgEnum("workflow_status", [
  "processing",
  "success",
]);

export const videos = pgTable("videos", {
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
  visibility: visibilityVideos("visibility").notNull().default("public"),
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
});

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
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.videoId] }),
  })
);

export const subscribersCount = pgTable(
  "subscribers_count",
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
  (table) => ({
    pk: primaryKey({ columns: [table.creatorId, table.viewerId] }),
  })
);

export const likedCount = pgTable("liked_count", {
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  videoId: uuid("video_id")
    .references(() => videos.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dislikeCount = pgTable("dislike_count", {
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  videoId: uuid("video_id")
    .references(() => videos.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
