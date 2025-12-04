import { ConfirmationModal } from "@/components/confirmation-modal";
import { Dropdown } from "@/components/dropdown";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
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
  playlistId: string;
}

export const PlaylistVideoDropdown = ({
  userLoginId,
  videoOwnerId,
  videoId,
  playlistId,
}: Props) => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [openRemovePlaylistModal, setOpenRemovePlaylistModal] = useState(false);

  const handleRemovePlaylist = useMutation(
    trpc.playlist.deleteVideo.mutationOptions({
      onSuccess: () => {
        setOpenRemovePlaylistModal(false);
        queryClient.invalidateQueries(
          trpc.playlist.getManyVideos.queryOptions({ playlistId })
        );
        toast.success("Video removed from playlist");
      },
    })
  );

  return (
    <>
      <ConfirmationModal
        onOpenChange={setOpenRemovePlaylistModal}
        open={openRemovePlaylistModal}
        description="Are you sure you want to remove this video from your playlist ?, this action cannot be undone!"
        onConfirm={() => handleRemovePlaylist.mutate({ videoId, playlistId })}
        isLoading={handleRemovePlaylist.isPending}
        confirmText="Remove"
        loadingConfirmText="Removing..."
      />
      <Dropdown>
        <DropdownMenuItem onClick={() => setOpenRemovePlaylistModal(true)}>
          <XIcon className="size-4 mr-2" />
          Remove from playlist
        </DropdownMenuItem>
        {userLoginId === videoOwnerId && (
          <DropdownMenuItem
            onClick={() => {
              router.push(`/studio/video/${videoId}`);
            }}
          >
            <SettingsIcon className="size-4 mr-2" />
            Manage video
          </DropdownMenuItem>
        )}
      </Dropdown>
    </>
  );
};
