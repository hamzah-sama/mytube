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

type WeebhokEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetTrackReadyWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetDeletedWebhookEvent;

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET!;

export const POST = async (req: Request) => {
  if (!SIGNING_SECRET) throw new Error("Missing MUX_SIGNING_SECRET");

  const headersPayload = await headers();
  const muxSignature = headersPayload.get("Mux-Signature");

  if (!muxSignature)
    throw new Response("Missing Mux-Signature", { status: 400 });

  const payload = await req.json();
  const body = JSON.stringify(payload);

  mux.webhooks.verifySignature(
    body,
    {
      "mux-signature": muxSignature,
    },
    SIGNING_SECRET
  );

  switch (payload.type as WeebhokEvent["type"]) {
    case "video.asset.created": {
      const data = payload.data as VideoAssetCreatedWebhookEvent["data"];
      if (!data.upload_id) {
        throw new Response("Missing upload_id", { status: 400 });
      }

      await db
        .update(videos)
        .set({
          muxAssetId: data.upload_id,
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
      const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.png`;
      const previewUrl = `https://image.mux.com/${playbackId}/animated.gif`;
      await db
        .update(videos)
        .set({
          muxStatus: data.status,
          muxPlaybackId: playbackId,
          thumbnailUrl,
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
      await db.delete(videos).where(eq(videos.muxUploadedId, data.upload_id));
      break;
    }
  }

  return new Response("webhook received", { status: 200 });
};
