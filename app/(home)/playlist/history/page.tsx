import {
  VideoColumnSkeleton,
  VideoRowSkeleton,
} from "@/modules/videos/components/skeleton/video-skeleton";
import { HistoryView } from "@/modules/view-and-history/history/ui/view/history-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Page = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.video.getHistory.queryOptions());
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary
        fallback={
          <p className="text-center text-muted-foreground">
            Something went wrong
          </p>
        }
      >
        <Suspense fallback={<PageSkeleton />}>
          <HistoryView />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  );
};

export default Page;

const PageSkeleton = () => {
  return (
    <div className="mx-auto max-w-[2400px] px-4 ">
      <h1 className="text-3xl font-bold">History</h1>
      <p className="text-sm text-muted-foreground mb-5">
        Videos you have watched
      </p>
        <VideoRowSkeleton />
    </div>
  );
};
