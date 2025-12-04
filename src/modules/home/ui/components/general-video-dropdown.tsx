import { Dropdown } from "@/components/dropdown";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { PlaylistModal } from "@/modules/playlist/ui/components/playlist-modal";
import { ListIcon, SettingsIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  userLoginId: string | undefined;
  videoOwnerId: string;
  videoId: string;
}

export const GeneralVideoDropdown = ({
  userLoginId,
  videoOwnerId,
  videoId,
}: Props) => {
  const router = useRouter();
  const [openPlaylistModal, setOpenPlaylistModal] = useState(false);

  return (
    <>
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
