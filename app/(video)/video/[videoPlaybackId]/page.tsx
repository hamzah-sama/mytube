import { VideoSkeleton } from "@/modules/videos/components/video-skeleton";
import { VideoView } from "@/modules/videos/view/video-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  params: Promise<{ videoPlaybackId: string }>;
}

const Page = async ({ params }: Props) => {
  const { videoPlaybackId } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.video.getOne.queryOptions({ videoPlaybackId })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <Suspense fallback={<VideoSkeleton />}>
          <VideoView videoPlaybackId={videoPlaybackId} />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  );
};

export default Page;
