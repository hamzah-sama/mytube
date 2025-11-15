"use client";

import { VideoPlayer } from "@/components/video-player";
import { fallbackThumbnail } from "@/constant";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { VideoAlert } from "@/components/video-alert";
import { VideoDetails } from "./video-details";
import { useAuth } from "@clerk/nextjs";

interface Props {
  videoPlaybackId: string;
}

export const VideoSection = ({ videoPlaybackId }: Props) => {
  const trpc = useTRPC();
  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  const { data: video } = useSuspenseQuery(
    trpc.video.getOne.queryOptions({ videoPlaybackId })
  );

 const createViewCount = useMutation(
    trpc.viewCount.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.video.getOne.queryOptions({ videoPlaybackId })
        );
      },
    })
  );
  const handlePlay = () => {
    if (!isSignedIn) return;
    createViewCount.mutate({ videoId: video.id });
  };

  return (
    <>
      <div
        className={cn(
          "relative bg-background rounded-xl overflow-hidden aspect-video",
          video.muxStatus !== "ready" && "rounded-b-none"
        )}
      >
        {video.muxPlaybackId && (
          <VideoPlayer
            playbackId={video.muxPlaybackId}
            imageThumbnail={video.thumbnailUrl ?? fallbackThumbnail}
            isAutoPlay
            handlePlay={handlePlay}
          />
        )}
      </div>
      {video.muxStatus !== "ready" && <VideoAlert />}
      <VideoDetails video={video} />
    </>
  );
};
