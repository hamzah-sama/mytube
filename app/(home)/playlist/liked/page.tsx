export const dynamic = "force-dynamic";

import { LikedVideos } from "@/modules/videos-reaction/ui/liked-videos";
import { VideoRowSkeleton } from "@/modules/videos/components/skeleton/video-skeleton";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Page = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.video.getLikedVideos.queryOptions());
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary
        fallback={
          <div className="flex justify-center">Something went wrong.</div>
        }
      >
        <Suspense fallback={<PageSkeleton />}>
          <LikedVideos />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  );
};

export default Page;

const PageSkeleton = () => {
  return (
    <div className="mx-auto max-w-[2400px] px-4 ">
      <h1 className="text-3xl font-bold">Liked videos</h1>
      <p className="text-sm text-muted-foreground mb-5">
        Your favorite videos all in one place
      </p>
      <VideoRowSkeleton />
    </div>
  );
};
