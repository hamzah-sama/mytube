import { ConfirmationModal } from "@/components/confirmation-modal";
import { Dropdown } from "@/components/dropdown";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { PlaylistModal } from "@/modules/playlist/ui/components/playlist-modal";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ListIcon, SettingsIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  userLoginId: string | undefined;
  videoOwnerId: string;
  videoId: string;
}

export const LikeVideoDropdown = ({
  userLoginId,
  videoOwnerId,
  videoId,
}: Props) => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [openCancelLikeModal, setOpenCancelLikeModal] = useState(false);
  const [openPlaylistModal, setOpenPlaylistModal] = useState(false);

  const handleCancelLike = useMutation(
    trpc.videoReaction.liked.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.video.getLikedVideos.queryOptions());
        toast.success("Like removed successfully");
      },
    })
  );

  return (
    <>
      <ConfirmationModal
        onOpenChange={setOpenCancelLikeModal}
        open={openCancelLikeModal}
        description="Are you sure you want to cancel your like on this video and remove from your liked videos, this action cannot be undone!"
        onConfirm={() => handleCancelLike.mutate({ videoId })}
        isLoading={handleCancelLike.isPending}
        confirmText="Remove"
        loadingConfirmText="Removing..."
      />
      <PlaylistModal
        open={openPlaylistModal}
        setOPen={setOpenPlaylistModal}
        videoId={videoId}
      />
      <Dropdown>
        <DropdownMenuItem onClick={() => setOpenPlaylistModal(true)}>
          <ListIcon className="size-4 mr-2" />
          Add to playlist
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setOpenCancelLikeModal(true)}>
          <XIcon className="size-4 mr-2" />
          Cancel like video
        </DropdownMenuItem>
        {userLoginId === videoOwnerId && (
          <DropdownMenuItem
            onClick={() => router.push(`/studio/video/${videoId}`)}
          >
            <SettingsIcon className="size-4 mr-2" />
            Manage video
          </DropdownMenuItem>
        )}
      </Dropdown>
    </>
  );
};
