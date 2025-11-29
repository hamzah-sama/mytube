import { Button } from "@/components/ui/button";
import { commentType } from "@/type";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  LucideSquareArrowOutDownRight,
  MoreVerticalIcon,
  Trash2Icon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CommentsReaction } from "../../../comments-reaction/ui/components/comments-reaction";
import { useClerk } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Hint } from "@/components/hint";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { useState } from "react";
import { toast } from "sonner";
import { CommentsRepliesForm } from "@/modules/comments/components/ui/comments-replies-form";
import { ReplyLists } from "@/modules/comments/components/ui/comments-replies-list";

interface Props {
  data: commentType;
  index: number;
  videoPlaybackId: string;
}

export const CommentsList = ({ data, index, videoPlaybackId }: Props) => {
  const comment = data.getComments[index];
  const replies = data.getCommentswithReplies[index].replies;

  const [visibleCount, setVisibleCount] = useState(4);
  const visibleReplies = replies.slice(0, visibleCount);

  const [openModal, setOpenModal] = useState(false);
  const [isOpenReplyForm, setOpenReplyForm] = useState(false);
  const [isOpenReplylist, setOpenReplylist] = useState(false);
  const { user } = useClerk();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: videoOwnerId } = useQuery(
    trpc.comments.getVideoOwner.queryOptions({ videoPlaybackId })
  );

  const canDeleteComment =
    user?.id === videoOwnerId?.clerkId || user?.id === comment.user.clerkId;

  const deleteComment = useMutation(
    trpc.comments.deleteComment.mutationOptions({
      onSuccess: () => {
        setOpenModal(false);
        toast.success("Comment deleted");
        queryClient.invalidateQueries(
          trpc.comments.getMany.queryOptions({ videoPlaybackId })
        );
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  return (
    <>
      <ConfirmationModal
        open={openModal}
        onOpenChange={setOpenModal}
        description="this action cannot be undone, are you sure want to delete this comment permanently?"
        onConfirm={() =>
          deleteComment.mutate({ commentId: comment.id, videoPlaybackId })
        }
        isLoading={deleteComment.isPending}
      />
      <div className="flex flex-col">
        <div className="py-5 flex justify-between">
          <div className="flex space-x-4">
            <div className="relative overflow-hidden size-10 rounded-full">
              <Image
                src={comment.user.imageUrl}
                alt={comment.user.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex gap-2">
                <Link
                  href={`/users/${comment.userId}`}
                  className="text-sm font-semibold"
                >
                  @{comment.user.name}
                </Link>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(comment.createdAt, {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div>{comment.content}</div>
              <div className="flex gap-2">
                <CommentsReaction
                  commentId={comment.id}
                  videoPlaybackId={videoPlaybackId}
                  likedCount={comment.likedCount}
                  dislikedCount={comment.dislikeCount}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="w-auto rounded-full px-4"
                  onClick={() => setOpenReplyForm(true)}
                >
                  Reply
                </Button>
              </div>
            </div>
          </div>
          {canDeleteComment && !!user && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-0">
                <Hint text="Delete comment" side="bottom">
                  <DropdownMenuItem onClick={() => setOpenModal(true)}>
                    <Trash2Icon className="size-4 text-red-500" />
                  </DropdownMenuItem>
                </Hint>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {isOpenReplyForm && (
          <CommentsRepliesForm
            commentId={comment.id}
            videoPlaybackId={videoPlaybackId}
            onSuccess={() => {
              setOpenReplyForm(false);
              setOpenReplylist(true);
            }}
            onCancel={() => setOpenReplyForm(false)}
          />
        )}
        {replies.length > 0 && (
          <div className="text-blue-600 pl-14 -translate-y-4">
            <Button
              variant="ghost"
              onClick={() => setOpenReplylist((prev) => !prev)}
            >
              {isOpenReplylist ? (
                <ChevronUpIcon className="size-4" />
              ) : (
                <ChevronDownIcon className="size-4" />
              )}
              {replies.length}
              <span>{replies.length === 1 ? "reply" : "replies"}</span>
            </Button>
          </div>
        )}
        {isOpenReplylist && (
          <div className="pl-14">
            {visibleReplies.map((reply) => (
              <ReplyLists
                data={reply}
                key={reply.id}
                videoClerkId={videoOwnerId?.clerkId}
                commentclerkId={comment.user.clerkId}
                videoPlaybackId={videoPlaybackId}
                commentId={comment.id}
              />
            ))}

            {visibleCount < replies.length && (
              <Button
                variant="ghost"
                className="text-blue-500 text-xs hover:bg-blue-50"
                onClick={() => setVisibleCount(visibleCount + 2)}
              >
                <LucideSquareArrowOutDownRight className="size-3" />
                Load more replies
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
};
