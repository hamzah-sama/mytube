import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  const { openSignIn } = useClerk();
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
        queryClient.invalidateQueries(
          trpc.reactionCount.isLiked.queryOptions({ videoId })
        );
        queryClient.invalidateQueries(
          trpc.reactionCount.isDisliked.queryOptions({ videoId })
        );
      },
      onError: (err) => {
        toast.error(err.message);
        if (err.data?.code === "UNAUTHORIZED") {
          openSignIn();
        }
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
        queryClient.invalidateQueries(
          trpc.reactionCount.isDisliked.queryOptions({ videoId })
        );
        queryClient.invalidateQueries(
          trpc.reactionCount.isLiked.queryOptions({ videoId })
        );
      },
      onError: (err) => {
        toast.error(err.message);
        if (err.data?.code === "UNAUTHORIZED") {
          openSignIn();
        }
      },
    })
  );

  const { data: isLiked } = useQuery({
    ...trpc.reactionCount.isLiked.queryOptions({
      videoId,
    }),
    enabled: !!videoPlaybackId,
  });
  const { data: isDisliked } = useQuery({
    ...trpc.reactionCount.isDisliked.queryOptions({
      videoId,
    }),
    enabled: !!videoPlaybackId,
  });

  const [like, setLike] = useState(isLiked ?? false);
  const [dislike, setDislike] = useState(isDisliked ?? false);
  const [totalLiked, setTotalLiked] = useState(likedCount);
  const [totalDisliked, setTotalDisliked] = useState(dislikedCount);

  useEffect(() => {
    if (isLiked !== undefined) setLike(isLiked);
    if (isDisliked !== undefined) setDislike(isDisliked);
  }, [isLiked, isDisliked]);

  const handleLikeButton = () => {
    setLike((prev) => !prev);
    setDislike(false);
    setTotalLiked(like ? totalLiked - 1 : totalLiked + 1);
    setTotalDisliked(dislike ? totalDisliked - 1 : totalDisliked);
    handleLiked.mutate({ videoId });
  };

  const handleDislikeButton = () => {
    setDislike((prev) => !prev);
    setLike(false);
    setTotalDisliked(dislike ? totalDisliked - 1 : totalDisliked + 1);
    setTotalLiked(like ? totalLiked - 1 : totalLiked);
    handleDisliked.mutate({ videoId });
  };

  return (
    <div className=" flex items-center rounded-full bg-accent">
      <Hint text={like ? "unlike" : "I like this"} side="bottom">
        <Button
          variant="secondary"
          className="text-lg  rounded-l-full min-w-20"
          onClick={handleLikeButton}
          disabled={handleDisliked.isPending || handleLiked.isPending}
        >
          <ThumbsUpIcon className={cn("size-6", like && "fill-current")} />
          {totalLiked}
        </Button>
      </Hint>
      |
      <Hint text={dislike ? " not dislike" : "I dislike this"} side="bottom">
        <Button
          onClick={handleDislikeButton}
          variant="secondary"
          className="text-lg  rounded-r-full min-w-20"
          disabled={handleDisliked.isPending || handleLiked.isPending}
        >
          <ThumbsDownIcon className={cn("size-6", dislike && "fill-current")} />
          {totalDisliked}
        </Button>
      </Hint>
    </div>
  );
};
