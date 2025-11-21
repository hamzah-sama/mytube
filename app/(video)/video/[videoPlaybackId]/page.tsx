import { CommentsSkeleton } from "@/modules/comments/components/ui/comments-skeleton";
import { CommentView } from "@/modules/comments/components/view/comment-view";
import { VideoError } from "@/modules/videos/components/video-error";
import { VideoSection } from "@/modules/videos/components/video-section";
import { VideoSkeleton } from "@/modules/videos/components/video-skeleton";
import { SugestionSection } from "@/modules/videos/components/video-sugestion";
import { VideoSuggestionSkeleton } from "@/modules/videos/components/video-sugestion-skeleton";
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
  void queryClient.prefetchQuery(
    trpc.comments.getMany.queryOptions({ videoPlaybackId })
  );
  void queryClient.prefetchQuery(
    trpc.video.getSuggestions.queryOptions({ videoPlaybackId })
  );

  return (
    <div className="flex flex-col mx-auto max-w-[1700px] mb-10 p-2">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <ErrorBoundary fallback={<VideoError />}>
              <Suspense fallback={<VideoSkeleton />}>
                <VideoSection videoPlaybackId={videoPlaybackId} />
              </Suspense>
            </ErrorBoundary>
          </HydrationBoundary>
          <div className="hidden lg:block">
            <HydrationBoundary state={dehydrate(queryClient)}>
              <ErrorBoundary fallback={<p>Error...</p>}>
                <Suspense fallback={<CommentsSkeleton />}>
                  <CommentView videoPlaybackId={videoPlaybackId} />
                </Suspense>
              </ErrorBoundary>
            </HydrationBoundary>
          </div>
        </div>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <ErrorBoundary fallback={<p>Error...</p>}>
            <Suspense fallback={<VideoSuggestionSkeleton />}>
              <SugestionSection videoPlaybackId={videoPlaybackId} />
            </Suspense>
          </ErrorBoundary>
        </HydrationBoundary>
        <div className="block lg:hidden">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <ErrorBoundary fallback={<p>Error...</p>}>
              <Suspense fallback={<p>Loading...</p>}>
                <CommentView videoPlaybackId={videoPlaybackId} />
              </Suspense>
            </ErrorBoundary>
          </HydrationBoundary>
        </div>
      </div>
    </div>
  );
};

export default Page;
