import { Button } from "@/components/ui/button";
import { VideoCardColumn } from "@/components/video-card-column";
import { GeneralVideoDropdown } from "@/modules/home/ui/components/general-video-dropdown";
import { PlaylistCard } from "@/modules/playlist/ui/components/playlist-card";
import { useTRPC } from "@/trpc/client";
import { useInfiniteScroll } from "@/utils/use-infinite-scroll";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";

interface Props {
  userId: string;
  clerkUserId?: string | null;
}
export const UserContent = ({ userId, clerkUserId }: Props) => {
  const trpc = useTRPC();
  const [activeTab, setActiveTab] = useState("video");

  const { data: videos } = useSuspenseQuery(
    trpc.user.getManyVideos.queryOptions({ userId })
  );
  const { data: playlists } = useSuspenseQuery(
    trpc.user.getManyPlaylist.queryOptions({ userId })
  );

  const {
    isLoadingMore: videoIsLoadingMore,
    visibleCount: videoVisibleCount,
    loaderRef: videoLoaderRef,
  } = useInfiniteScroll({
    total: videos.length,
    enabled: activeTab === "video",
  });

  const visibleVideos = videos.slice(0, videoVisibleCount);

  const {
    isLoadingMore: playlistIsLoadingMore,
    visibleCount: playlistVisibleCount,
    loaderRef: playlistLoaderRef,
  } = useInfiniteScroll({
    total: playlists.length,
    enabled: activeTab === "playlist",
  });

  const visiblePlaylists = playlists.slice(0, playlistVisibleCount);

  return (
    <div className="flex flex-col space-y-6 pt-4">
      <div className="flex gap-4">
        <Button
          onClick={() => setActiveTab("video")}
          variant={activeTab === "video" ? "default" : "outline"}
        >
          Video
        </Button>
        <Button
          onClick={() => setActiveTab("playlist")}
          variant={activeTab === "playlist" ? "default" : "outline"}
        >
          Playlist
        </Button>
      </div>
      {activeTab === "video" && (
        <div>
          {visibleVideos.length === 0 ? (
            <p className="text-muted-foreground text-center pt-4">
              this user has no videos yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-10">
              {visibleVideos.map((video) => (
                <VideoCardColumn
                  key={video.id}
                  data={video}
                  dropdown={
                    <GeneralVideoDropdown
                      userLoginId={clerkUserId as string}
                      videoOwnerId={video.user.clerkId}
                      videoId={video.id}
                    />
                  }
                />
              ))}
            </div>
          )}
          {videoIsLoadingMore && (
            <div ref={videoLoaderRef} className="flex justify-center py-6">
              <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      )}
      {activeTab === "playlist" && (
        <div>
          {visiblePlaylists.length === 0 ? (
            <p className="text-muted-foreground text-center pt-4">
              This user has no playlist to show
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
              {visiblePlaylists.map((playlist) => (
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
          {playlistIsLoadingMore && (
            <div ref={playlistLoaderRef} className="flex justify-center py-6">
              <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
