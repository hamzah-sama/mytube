import { Skeleton } from "@/components/ui/skeleton";
import { LikedVideos } from "@/modules/videos-reaction/ui/liked-videos";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Page = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.video.getLikedVideos.queryOptions());
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary fallback={<div className="flex justify-center">Something went wrong.</div>}>
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
      <div className="flex flex-col w-[90%] gap-3 mb-10">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="p-2" key={index}>
            <div className="flex flex-col lg:flex-row gap-3 w-full">
              <div className="relative aspect-video w-full lg:w-[400px] shrink-0">
                <Skeleton className="w-full h-full rounded-xl" />
              </div>
              <div className="flex items-start justify-between w-full gap-2">
                <div className="flex flex-col flex-1 min-w-0 gap-2">
                  <Skeleton className="w-full h-6 rounded-md" />
                  <Skeleton className="w-1/2 h-4 rounded-md" />
                  <div className="flex gap-2">
                    <Skeleton className="size-7 rounded-full shrink-0" />
                    <Skeleton className="w-1/4 h-4 rounded-md" />
                  </div>
                  <Skeleton className="w-full h-12 rounded-md" />
                </div>

                <Skeleton className="size-10 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
