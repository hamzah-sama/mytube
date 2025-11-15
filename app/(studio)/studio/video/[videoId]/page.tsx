import { VideoManagementSkeleton } from "@/modules/studio/ui/components/skeleton/video-management-skeleton";
import {
  VideoManagementView,
} from "@/modules/studio/ui/view/video-management-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  params: Promise<{ videoId: string }>;
}

const Page = async ({ params }: Props) => {
  const { videoId } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.studio.getOne.queryOptions({ videoId }));
  void queryClient.prefetchQuery(trpc.categories.getMany.queryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        <Suspense fallback={<VideoManagementSkeleton />}>
          <VideoManagementView videoId={videoId} />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  );
};

export default Page;
