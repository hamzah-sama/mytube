import {
  StudioVideoList,
  StudioVideoListSkeleton,
} from "@/modules/studio/ui/components/studio-video-list";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Page = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.studio.getMany.queryOptions());

  return (
    <div className="py-4 space-y-4">
      <div className="px-4">
        <h1 className="text-2xl font-bold">Channel Content</h1>
        <p className="text-muted-foreground text-sm">
          Manage your content and videos
        </p>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <Suspense fallback={<StudioVideoListSkeleton />}>
            <StudioVideoList />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </div>
  );
};

export default Page;
