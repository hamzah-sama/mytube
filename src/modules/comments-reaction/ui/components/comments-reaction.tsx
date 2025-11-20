import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  commentId: string;
  videoPlaybackId: string;
  likedCount: number;
  dislikedCount: number;
}
export const CommentsReaction = ({
  commentId,
  videoPlaybackId,
  likedCount,
  dislikedCount,
}: Props) => {
  const { openSignIn } = useClerk();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const addLiked = useMutation(
    trpc.commentsReaction.like.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.comments.getMany.queryOptions({ videoPlaybackId })
        );
        queryClient.invalidateQueries(
          trpc.commentsReaction.isLiked.queryOptions({ commentId })
        );
        queryClient.invalidateQueries(
          trpc.commentsReaction.isDisliked.queryOptions({ commentId })
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
  const addDisliked = useMutation(
    trpc.commentsReaction.dislike.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.comments.getMany.queryOptions({ videoPlaybackId })
        );
        queryClient.invalidateQueries(
          trpc.commentsReaction.isLiked.queryOptions({ commentId })
        );
        queryClient.invalidateQueries(
          trpc.commentsReaction.isDisliked.queryOptions({ commentId })
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

  const { data: isLiked } = useQuery(
    trpc.commentsReaction.isLiked.queryOptions({ commentId })
  );
  const { data: isDisiked } = useQuery(
    trpc.commentsReaction.isDisliked.queryOptions({ commentId })
  );

  const [like, setLike] = useState(isLiked ?? false);
  const [dislike, setDisLike] = useState(isDisiked ?? false);
  const [totalLiked, setTotalLiked] = useState(likedCount);
  const [totalDisliked, setTotalDisliked] = useState(dislikedCount);

  useEffect(() => {
    if (isLiked !== undefined) setLike(isLiked);
    if (isDisiked !== undefined) setDisLike(isDisiked);
  }, [isLiked, isDisiked]);

 const handleLikeButton = () => {
    setLike((prev) => !prev);
    setDisLike(false);
    setTotalLiked(like ? totalLiked - 1 : totalLiked + 1);
    setTotalDisliked(dislike ? totalDisliked - 1 : totalDisliked);
    addLiked.mutate({ commentId });
  };

  const handleDislikeButton = () => {
    setDisLike((prev) => !prev);
    setLike(false);
    setTotalDisliked(dislike ? totalDisliked - 1 : totalDisliked + 1);
    setTotalLiked(like ? totalLiked - 1 : totalLiked);
    addDisliked.mutate({ commentId });
  };

  return (
    <div className="flex space-x-4">
      <div>
        <Hint text="like" side="bottom">
          <Button
            disabled={addDisliked.isPending || addLiked.isPending}
            type="button"
            variant="ghost"
            size="icon"
            className="w-auto rounded-full px-2.5"
            onClick={handleLikeButton}
          >
            <ThumbsUp className={cn(like && "fill-current")} />
          </Button>
        </Hint>
        <span>{totalLiked}</span>
      </div>
      <div>
        <Hint text="dislike" side="bottom">
          <Button
            disabled={addDisliked.isPending || addLiked.isPending}
            type="button"
            variant="ghost"
            size="icon"
            className="w-auto rounded-full px-2.5"
            onClick={handleDislikeButton}
          >
            <ThumbsDown className={cn(dislike && "fill-current")} />
          </Button>
        </Hint>
        <span>{totalDisliked}</span>
      </div>
    </div>
  );
};
