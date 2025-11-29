import { VideoThumbnail } from "@/components/video-thumbnail";
import { fallbackUserPlaceholder } from "@/constant";
import { VideoDropdownMenu } from "@/modules/videos/components/video-dropdown-menu";
import { videoCardType } from "@/type";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ConfirmationModal } from "./confirmation-modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";

interface Props {
  data: videoCardType;
  isLikePage?: boolean;
  isHistoryPage?: boolean;
}

export const VideoCardRow = ({ data, isLikePage, isHistoryPage }: Props) => {
  const [openCancelLikeModal, setOpenCancelLikeModal] = useState(false);
  const [openRemoveHistoryModal, setOpenRemoveHistoryModal] = useState(false);
  const { user } = useUser();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const handleCancelLike = useMutation(
    trpc.videoReaction.liked.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.video.getLikedVideos.queryOptions());
        toast.success("Like removed successfully");
      },
    })
  );

  const handleRemoveHistory = useMutation(
    trpc.history.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.video.getHistory.queryOptions());
        toast.success("History removed successfully");
      },
    })
  )
  return (
    <>
      <ConfirmationModal
        onOpenChange={setOpenCancelLikeModal}
        open={openCancelLikeModal}
        description="Are you sure you want to cancel your like on this video and remove this video from your liked videos, this action cannot be undone!"
        onConfirm={() => {
          handleCancelLike.mutate({ videoId: data.id });
        }}
        isLoading={handleCancelLike.isPending}
        confirmText="Remove"
        loadingConfirmText="Removing..."
      />
      <ConfirmationModal
        onOpenChange={setOpenRemoveHistoryModal}
        open={openRemoveHistoryModal}
        description="Are you sure you want to remove video from your history, this action cannot be undone!"
        onConfirm={() => {
          handleRemoveHistory.mutate({ videoId: data.id });
        }}
        isLoading={handleRemoveHistory.isPending}
        confirmText="Remove"
        loadingConfirmText="Removing..."
      />
      <Link
        href={`/video/${data.muxPlaybackId}`}
        className="hover:bg-accent rounded-xl p-2 group flex-1"
      >
        <div className="flex flex-col lg:flex-row gap-3 w-full">
          {/* Thumbnail */}
          <div className="relative aspect-video w-full lg:w-[400px] shrink-0">
            <VideoThumbnail
              thumbnail={data.thumbnailUrl}
              preview={data.previewUrl}
              duration={data.duration}
            />
          </div>

          {/* Info Section */}
          <div className="flex items-start justify-between w-full gap-2">
            <div className="flex flex-col flex-1 min-w-0 gap-2">
              <h2 className="font-semibold text-lg line-clamp-2">
                {data.title}
              </h2>
              <p className="text-muted-foreground text-sm line-clamp-1">
                {data.count} views ·{" "}
                {formatDistanceToNow(data.createdAt, { addSuffix: true })}
              </p>
              <div className="flex gap-2">
                <div className="size-7 overflow-hidden relative rounded-full shrink-0">
                  <Image
                    src={data.user.imageUrl || fallbackUserPlaceholder}
                    alt={data.user.name || "User Placeholder"}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {data.user.name}
                </p>
              </div>
              <div className="text-muted-foreground text-sm line-clamp-2">
                {data.description || "No description"}
              </div>
            </div>
            <VideoDropdownMenu
              userLoginId={user?.id}
              videoOwnerId={data.user.clerkId}
              variant="row"
              isLikePage={isLikePage}
              setOpenCancelLikeModal={setOpenCancelLikeModal}
              videoId={data.id}
              isHistoryPage={isHistoryPage}
              setOpenRemoveHistoryModal={setOpenRemoveHistoryModal}
            />
          </div>
        </div>
      </Link>
    </>
  );
};
