import { ConfirmationModal } from "@/components/confirmation-modal";
import { Dropdown } from "@/components/dropdown";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { PlaylistModal } from "@/modules/playlist/ui/components/playlist-modal";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { error } from "console";
import { ListIcon, SettingsIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  userLoginId: string | undefined;
  videoOwnerId: string;
  videoId: string;
}

export const HistoryVideoDropdown = ({
  userLoginId,
  videoOwnerId,
  videoId,
}: Props) => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [openRemoveHistoryModal, setOpenRemoveHistoryModal] = useState(false);
  const [openPlaylistModal, setOpenPlaylistModal] = useState(false);

  const handleRemoveHistory = useMutation(
    trpc.history.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.video.getHistory.queryOptions());
        setOpenRemoveHistoryModal(false);
        toast.success("video removed successfully");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  return (
    <>
      <ConfirmationModal
        onOpenChange={setOpenRemoveHistoryModal}
        open={openRemoveHistoryModal}
        description="Are you sure you want to remove this video from your history, this action cannot be undone!"
        onConfirm={() => handleRemoveHistory.mutate({ videoId })}
        isLoading={handleRemoveHistory.isPending}
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
        <DropdownMenuItem
          onClick={(e) => {
            setOpenRemoveHistoryModal(true);
          }}
        >
          <XIcon className="size-4 mr-2" />
          Remove from history
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
