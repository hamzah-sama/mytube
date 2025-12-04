import { ResponsiveModal } from "@/components/responsiveModal";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CreatePlaylistForm } from "./create-playlist-form";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  videoId: string;
}
export const PlaylistModal = ({ open, setOpen, videoId }: Props) => {
  const trpc = useTRPC();
  const [openModal, setOpenModal] = useState(false); // for create and add to playlist
  const { data } = useSuspenseQuery(trpc.playlist.getMany.queryOptions());

  const addVideoToPlaylist = useMutation(
    trpc.playlist.addVideo.mutationOptions({
      onSuccess: () => {
        setOpen(false);
        toast.success("Video added to playlist");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );
  return (
    <>
      <ResponsiveModal
        title="Create playlist"
        onOpenChange={setOpenModal}
        open={openModal}
      >
        <CreatePlaylistForm setOpenModal={setOpenModal} />
      </ResponsiveModal>
      <ResponsiveModal title="Add to..." onOpenChange={setOpen} open={open}>
        <div className="flex flex-col gap-3">
          {data.map((playlist) => {
            return (
              <Button
                variant="outline"
                key={playlist.id}
                onClick={() =>
                  addVideoToPlaylist.mutate({
                    playlistId: playlist.id,
                    videoId,
                  })
                }
                disabled={addVideoToPlaylist.isPending}
              >
                {playlist.name}
              </Button>
            );
          })}
          {addVideoToPlaylist.isPending && (
            <p className="flex items-center justify-center">
              <Loader2Icon className="animate-spin size-4" />
            </p>
          )}
          <Button className="mt-7" onClick={() => setOpenModal(true)}>
            <PlusIcon className="mr-2" />
            Create playlist
          </Button>
        </div>
      </ResponsiveModal>
    </>
  );
};
