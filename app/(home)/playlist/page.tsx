import { Skeleton } from "@/components/ui/skeleton";
import { PlaylistView } from "@/modules/playlist/ui/view/playlist-view";
import { VideoError } from "@/modules/videos/components/video-error";
import { getQueryClient, trpc } from "@/trpc/server";
import { useUser } from "@clerk/nextjs";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Page = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.playlist.getMany.queryOptions());
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary fallback={<VideoError />}>
        <Suspense fallback={<PageSkeleton />}>
          <PlaylistView />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  );
};

export default Page;

const PageSkeleton = () => {
  return (
    <div className="mx-auto max-w-[2400px] px-4 flex flex-col gap-4">
      <div className="flex justify-between ">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Playlist</h1>
          <p className="text-sm text-muted-foreground mb-5">
            Playlists you have created
          </p>
        </div>
        <Skeleton className="h-4 w-30" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index}>
            <Skeleton className="h-40 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
};
