"use client";

import { ConfirmationModal } from "@/components/confirmation-modal";
import { Dropdown } from "@/components/dropdown";
import { ResponsiveModal } from "@/components/responsiveModal";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { VideoCardRow } from "@/components/video-card-row";
import { useTRPC } from "@/trpc/client";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Edit2Icon, Loader2Icon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { UpdatePlaylistForm } from "../components/update-playlist-form";
import { PlaylistVideoDropdown } from "../components/playlist-video-dropdown";
import { useUser } from "@clerk/nextjs";
import { useInfiniteScroll } from "@/utils/use-infinite-scroll";

interface Props {
  playlistId: string;
}

export const PlaylistVideosView = ({ playlistId }: Props) => {
  const { user } = useUser();
  const [openDeletePlaylistModal, setOpendeletePlaylistModal] = useState(false);
  const [openUpdatePlaylistModal, setOpenUpdatePlaylistModal] = useState(false);
  const trpc = useTRPC();
  const router = useRouter();
  const { data } = useSuspenseQuery(
    trpc.playlist.getManyVideos.queryOptions({ playlistId })
  );
  const { data: playlist } = useSuspenseQuery(
    trpc.playlist.getOne.queryOptions({ playlistId })
  );

  const handleDeletePlaylist = useMutation(
    trpc.playlist.delete.mutationOptions({
      onSuccess: () => {
        setOpendeletePlaylistModal(false);
        router.push("/playlist");
        toast.success("Playlist deleted successfully");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const { isLoadingMore, visibleCount, loaderRef } = useInfiniteScroll({
    total: data.length,
  });

  const visiblePlaylists = data.slice(0, visibleCount);
  return (
    <>
      <ConfirmationModal
        onOpenChange={setOpendeletePlaylistModal}
        open={openDeletePlaylistModal}
        description="Are you sure you want to Delete this playlist and all of its videos? this action cannot be undone!"
        onConfirm={() => {
          handleDeletePlaylist.mutate({ playlistId });
        }}
        isLoading={handleDeletePlaylist.isPending}
        confirmText="Delete"
        loadingConfirmText="Deleting..."
      />
      <ResponsiveModal
        title="Update playlist"
        open={openUpdatePlaylistModal}
        onOpenChange={setOpenUpdatePlaylistModal}
      >
        <UpdatePlaylistForm
          setOpenModal={setOpenUpdatePlaylistModal}
          playlist={playlist}
        />
      </ResponsiveModal>
      <div className="mx-auto max-w-[2400px] px-4">
        <div className="flex justify-between lg:pr-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">{playlist?.name}</h1>
            <p className="text-sm text-muted-foreground mb-5">
              Videos from {playlist?.name}'s playlist
            </p>
          </div>
          <div className="mt-10">
            {user?.id === playlist.ownerClerkId && (
              <Dropdown>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setOpenUpdatePlaylistModal(true)}
                >
                  <Edit2Icon className="mr-2" />
                  Edit playlist
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setOpendeletePlaylistModal(true)}
                >
                  <Trash2Icon className=" mr-2 text-red-400" />
                  Delete playlist
                </DropdownMenuItem>
              </Dropdown>
            )}
          </div>
        </div>

        {data?.length === 0 ? (
          <p className="text-muted-foreground text-center pt-4">
            {`${playlist?.name} has no videos yet.`}
          </p>
        ) : (
          <div className="flex flex-col w-[90%] gap-3 mb-10">
            {visiblePlaylists?.map((video) => (
              <VideoCardRow
                key={video.id}
                data={video}
                dropdown={
                  <PlaylistVideoDropdown
                    videoId={video.id}
                    userLoginId={user?.id}
                    playlistId={playlistId}
                    playlistClerkId={playlist.ownerClerkId}
                    videoOwnerId={video.user.clerkId}
                  />
                }
              />
            ))}
          </div>
        )}
      </div>
      {isLoadingMore && (
        <div ref={loaderRef} className="flex justify-center py-6">
          <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </>
  );
};
