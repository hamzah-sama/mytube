import { Button } from "@/components/ui/button";
import { commentType, replyType } from "@/type";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronDown,
  ChevronDownIcon,
  ChevronUpIcon,
  MoreVerticalIcon,
  Trash2Icon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
// import { CommentsReaction } from "../../../comments-reaction/ui/components/comments-reaction";
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
import { CommentsRepliesForm } from "@/modules/comments-replies/ui/comments-replies-form";
import { CommentsReaction } from "@/modules/comments-reaction/ui/components/comments-reaction";

interface Props {
  data: replyType;
  videoClerkId: string | undefined;
  commentclerkId: string | undefined;
  videoPlaybackId: string;
  commentId: string;
}

export const ReplyLists = ({
  data,
  commentId,
  videoClerkId,
  commentclerkId,
  videoPlaybackId,
}: Props) => {
  const [openModal, setOpenModal] = useState(false);
  const [isOpenReplyForm, setOpenReplyForm] = useState(false);
  const { user } = useClerk();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const canDeleteComment =
    user?.id === videoClerkId ||
    user?.id === commentclerkId ||
    user?.id === data.user.clerkId;

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
        desription="this action cannot be undone, are you sure want to delete this reply permanently?"
        onConfirm={() =>
          deleteComment.mutate({ commentId: data.id, videoPlaybackId })
        }
        isLoading={deleteComment.isPending}
      />
      <div className="flex flex-col">
        <div className="py-2 flex justify-between">
          <div className="flex space-x-4">
            <div className="relative overflow-hidden size-7 rounded-full">
              <Image
                src={data.user.imageUrl}
                alt={data.user.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex gap-2">
                <Link
                  href={`/users/${data.userId}`}
                  className="text-sm font-semibold"
                >
                  @{data.user.name}
                </Link>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(data.createdAt, {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div>{data.content}</div>
              <div className="flex gap-2">
                <CommentsReaction
                  commentId={data.id}
                  videoPlaybackId={videoPlaybackId}
                  likedCount={data.likedCount}
                  dislikedCount={data.dislikeCount}
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
          {canDeleteComment && (
            <DropdownMenu modal>
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
            commentId={commentId}
            videoPlaybackId={videoPlaybackId}
            onSuccess={() => setOpenReplyForm(false)}
            onCancel={() => setOpenReplyForm(false)}
          />
        )}
      </div>
    </>
  );
};
