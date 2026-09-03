export const dynamic = "force-dynamic";

import { Skeleton } from "@/components/ui/skeleton";
import { PlaylistVideosView } from "@/modules/playlist/ui/view/playlist-videos-view";
import { VideoRowSkeleton } from "@/modules/videos/components/skeleton/video-skeleton";
import { VideoError } from "@/modules/videos/components/video-error";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  params: Promise<{ playlistId: string }>;
}
const Page = async ({ params }: Props) => {
  const { playlistId } = await params;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.playlist.getManyVideos.queryOptions({ playlistId })
  );
  void queryClient.prefetchQuery(
    trpc.playlist.getOne.queryOptions({ playlistId })
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary fallback={<VideoError />}>
        <Suspense fallback={<PlaylistSkeleton />}>
          <PlaylistVideosView playlistId={playlistId} />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  );
};

export default Page;

export const PlaylistSkeleton = () => {
  return (
    <div className="mx-auto max-w-[2400px] px-4">
      <div className="flex justify-between lg:pr-8">
        <div className="flex flex-col gap-4 mb-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="rounded-full size-6" />
      </div>
      <VideoRowSkeleton />
    </div>
  );
};
