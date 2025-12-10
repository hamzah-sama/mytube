import { Dropdown } from "@/components/dropdown";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { PlaylistModal } from "@/modules/playlist/ui/components/playlist-modal";
import { useClerk } from "@clerk/nextjs";
import { ListIcon, SettingsIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
  const { isSignedIn } = useClerk();
  const clerk = useClerk();
  const router = useRouter();
  const [openPlaylistModal, setOpenPlaylistModal] = useState(false);

  return (
    <>
      <PlaylistModal
        open={openPlaylistModal}
        setOpen={setOpenPlaylistModal}
        videoId={videoId}
      />
      <Dropdown>
        <DropdownMenuItem
          onClick={() => {
            if (!isSignedIn) {
              toast.info("You need to be signed in to perform this action.");
              return clerk.openSignIn();
            }
            setOpenPlaylistModal(true);
          }}
        >
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
