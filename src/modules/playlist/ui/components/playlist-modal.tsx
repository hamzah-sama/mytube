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
  setOPen: (open: boolean) => void; //for playlist modal
  videoId: string;
}
export const PlaylistModal = ({ open, setOPen, videoId }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [openModal, setOPenModal] = useState(false); // for create and add to playlist
  const { data } = useSuspenseQuery(trpc.playlist.getMany.queryOptions());

  const addVideoToPlaylist = useMutation(
    trpc.playlist.addVideo.mutationOptions({
      onSuccess: () => {
        setOPen(false);
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
        onOpenChange={setOPenModal}
        open={openModal}
      >
        <CreatePlaylistForm setOpenModal={setOPenModal} />
      </ResponsiveModal>
      <ResponsiveModal title="Add to..." onOpenChange={setOPen} open={open}>
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
          <Button className="mt-7" onClick={() => setOPenModal(true)}>
            <PlusIcon className="mr-2" />
            Create playlist
          </Button>
        </div>
      </ResponsiveModal>
    </>
  );
};
