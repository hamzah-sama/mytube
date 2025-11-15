import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { useState } from "react";

interface Props {
  videoPlaybackId: string | null;
  videoId: string;
  likedCount: number;
  dislikedCount: number;
}
export const VideoReaction = ({
  videoId,
  videoPlaybackId,
  likedCount,
  dislikedCount,
}: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const handleLiked = useMutation(
    trpc.reactionCount.liked.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.video.getOne.queryOptions({
            videoPlaybackId: videoPlaybackId!,
          })
        );
      },
    })
  );

  const handleDisliked = useMutation(
    trpc.reactionCount.disliked.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.video.getOne.queryOptions({
            videoPlaybackId: videoPlaybackId!,
          })
        );
      },
    })
  );

  return (
    <div className=" flex items-center rounded-full bg-accent">
      <Hint text="I like this" side="bottom">
        <Button
          variant="secondary"
          className="text-lg  rounded-l-full min-w-20"
          onClick={() => handleLiked.mutate({ videoId })}
          disabled={handleDisliked.isPending || handleLiked.isPending}
        >
          <ThumbsUpIcon
            className={cn("size-6", likedCount === 1 && "fill-current")}
          />
          {likedCount}
        </Button>
      </Hint>
      |
      <Hint text="I dislike this" side="bottom">
        <Button
          onClick={() => handleDisliked.mutate({ videoId })}
          variant="secondary"
          className="text-lg  rounded-r-full min-w-20"
          disabled={handleDisliked.isPending || handleLiked.isPending}
        >
          <ThumbsDownIcon
            className={cn("size-6", dislikedCount === 1 && "fill-current")}
          />
          {dislikedCount}
        </Button>
      </Hint>
    </div>
  );
};
