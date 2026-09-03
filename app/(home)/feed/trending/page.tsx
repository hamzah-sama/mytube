import { Skeleton } from "@/components/ui/skeleton";
import { TrendingView } from "@/modules/trending/ui/view/trending-view";
import { VideoRowSkeleton } from "@/modules/videos/components/skeleton/video-skeleton";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Page = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.video.getTrending.queryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary
        fallback={
          <div className="flex justify-center">Something went wrong</div>
        }
      >
        <Suspense fallback={<PageSkeleton />}>
          <TrendingView />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  );
};

export default Page;

const PageSkeleton = () => {
  return (
    <div className="mx-auto max-w-[2400px] px-4 ">
      <h1 className="text-3xl font-bold">Trending</h1>
      <p className="text-sm text-muted-foreground mb-5">
        Most popular videos at the moment
      </p>
      <VideoRowSkeleton />
    </div>
  );
};
