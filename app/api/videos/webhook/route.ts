import { db } from "@/db";
import { videos } from "@/db/schema";
import { mux } from "@/lib/mux";
import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetDeletedWebhookEvent,
} from "@mux/mux-node/resources/webhooks";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { UTApi } from "uploadthing/server";

type WeebhokEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetTrackReadyWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetDeletedWebhookEvent;

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET!;

export const POST = async (req: Request) => {
  const utApi = new UTApi();

  if (!SIGNING_SECRET) throw new Error("Missing MUX_SIGNING_SECRET");

  const headersPayload = await headers();
  const muxSignature = headersPayload.get("Mux-Signature");

  if (!muxSignature)
    throw new Response("Missing Mux-Signature", { status: 400 });

  const rawBody = await req.text();

  try {
    mux.webhooks.verifySignature(
      rawBody,
      {
        "mux-signature": muxSignature,
      },
      SIGNING_SECRET
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }
  const payload = JSON.parse(rawBody);

  switch (payload.type as WeebhokEvent["type"]) {
    case "video.asset.created": {
      const data = payload.data as VideoAssetCreatedWebhookEvent["data"];
      if (!data.upload_id) {
        throw new Response("Missing upload_id", { status: 400 });
      }

      await db
        .update(videos)
        .set({
          muxAssetId: data.id,
          muxStatus: data.status,
        })
        .where(eq(videos.muxUploadedId, data.upload_id));
      break;
    }

    case "video.asset.ready": {
      const data = payload.data as VideoAssetReadyWebhookEvent["data"];
      if (!data.upload_id) {
        throw new Response("Missing upload_id", { status: 400 });
      }

      const playbackId = data.playback_ids?.[0].id;
      if (!playbackId)
        throw new Response("Missing playback_id", { status: 400 });

      const [existingVideo] = await db
        .select({
          thumbnailUrl: videos.thumbnailUrl,
          previewUrl: videos.previewUrl,
        })
        .from(videos)
        .where(eq(videos.muxUploadedId, data.upload_id));

      if (existingVideo?.previewUrl && existingVideo?.thumbnailUrl) {
        return new Response("Files Already exists in uploadthing", {
          status: 400,
        });
      }

      const tempThumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.png`;
      const tempPreviewUrl = `https://image.mux.com/${playbackId}/animated.gif`;

      const [thumbnail, preview] = await utApi.uploadFilesFromUrl([
        tempThumbnailUrl,
        tempPreviewUrl,
      ]);
      if (!thumbnail.data || !preview.data) {
        throw new Response("Failed to upload files", { status: 500 });
      }

      const { key: thumbnailKey, ufsUrl: thumbnailUrl } = thumbnail.data;
      const { key: previewKey, ufsUrl: previewUrl } = preview.data;

      await db
        .update(videos)
        .set({
          muxStatus: data.status,
          muxPlaybackId: playbackId,
          thumbnailUrl,
          thumbnailKey,
          previewKey,
          previewUrl,
          duration: data.duration && Math.round(data.duration),
        })
        .where(eq(videos.muxUploadedId, data.upload_id));
      break;
    }
    case "video.asset.errored": {
      const data = payload.data as VideoAssetErroredWebhookEvent["data"];
      if (!data.upload_id) {
        throw new Response("Missing upload_id", { status: 400 });
      }
      await db
        .update(videos)
        .set({
          muxStatus: data.status,
        })
        .where(eq(videos.muxUploadedId, data.upload_id));
      break;
    }

    case "video.asset.deleted": {
      const data = payload.data as VideoAssetDeletedWebhookEvent["data"];
      if (!data.upload_id) {
        throw new Response("Missing upload_id", { status: 400 });
      }

      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(eq(videos.muxUploadedId, data.upload_id));

      if (!existingVideo) {
        return new Response("Video already deleted", { status: 200 });
      }

      if (!existingVideo.previewKey || !existingVideo.thumbnailKey) {
        throw new Response("Missing previewKey or thumbnailKey", { status: 404 });
      }

      await utApi.deleteFiles([
        existingVideo.previewKey,
        existingVideo.thumbnailKey,
      ]);

      await db.delete(videos).where(eq(videos.muxUploadedId, data.upload_id));
      break;
    }
  }

  return new Response("webhook received", { status: 200 });
};
