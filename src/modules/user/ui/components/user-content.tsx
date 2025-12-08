import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { VideoCardColumn } from "@/components/video-card-column";
import { GeneralVideoDropdown } from "@/modules/home/ui/components/general-video-dropdown";
import { PlaylistCard } from "@/modules/playlist/ui/components/playlist-card";
import { VideoColumnSkeleton } from "@/modules/videos/components/skeleton/video-skeleton";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

interface Props {
  userId: string;
  clerkUserId?: string | null
}
export const UserContent = ({ userId, clerkUserId }: Props) => {
  const trpc = useTRPC();

  const { data: videos, isLoading: isLoadingVideos } = useSuspenseQuery(
    trpc.user.getManyVideos.queryOptions({ userId })
  );
  const { data: playlists, isLoading: isLoadingPlaylists } = useSuspenseQuery(
    trpc.user.getManyPlaylist.queryOptions({ userId })
  );
  return (
    <Tabs defaultValue="video">
      <div className="border-b mb-4">
        <TabsList className="gap-7">
          <TabsTrigger value="video" className="text-lg">
            Video
          </TabsTrigger>
          <TabsTrigger value="playlist" className="text-lg">
            Playlist
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="min-h-[300px]">
        <TabsContent value="video" className="transition-none">
          {isLoadingVideos && <VideoColumnSkeleton />}
          {videos?.length === 0 ? (
            <p className="text-muted-foreground text-center pt-4">
              this user has no videos yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-10">
              {videos?.map((video) => (
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
        </TabsContent>
        <TabsContent value="playlist" className="transition-none">
          {isLoadingPlaylists && <VideoColumnSkeleton />}
          {playlists.length === 0 ? (
            <p className="text-muted-foreground text-center pt-4">
              This user has no playlist to show
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
              {playlists.map((playlist) => (
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
        </TabsContent>
      </div>
    </Tabs>
  );
};
