"use client";

import { ResponsiveModal } from "@/components/responsiveModal";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PlusIcon, User } from "lucide-react";
import { useState } from "react";
import { PlaylistCard } from "../components/playlist-card";
import { CreatePlaylistForm } from "../components/create-playlist-form";

export const PlaylistView = () => {
  const trpc = useTRPC();
  const [openPlaylistModal, setOpenPlaylistModal] = useState(false);
  const { data } = useSuspenseQuery(trpc.playlist.getMany.queryOptions());
  return (
    <div className="mx-auto max-w-[2400px] px-4 flex flex-col gap-4">
      <ResponsiveModal
        title="Create Playlist"
        open={openPlaylistModal}
        onOpenChange={setOpenPlaylistModal}
      >
        <CreatePlaylistForm setOpenModal={setOpenPlaylistModal} />
      </ResponsiveModal>
      <div className="flex justify-between ">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Playlist</h1>
          <p className="text-sm text-muted-foreground mb-5">
            Playlists you have created
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setOpenPlaylistModal(true);
          }}
          className="flex items-center"
        >
          <PlusIcon className="mr-2" />
          Create playlist
        </Button>
      </div>
      {data.length === 0 ? (
        <p className="text-muted-foreground text-center pt-4">
          You have no playlist yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
          {data.map((playlist) => (
            <div key={playlist.id}>
              <PlaylistCard
                name={playlist.name}
                id={playlist.id}
                videosCount={playlist.videosCount}
                thumbnail={playlist.thumbnailUrl}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
