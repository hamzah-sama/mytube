import { getQueryClient, trpc } from "@/trpc/server";
import { VideoSection } from "../components/video-section";
import { SugestionSection } from "../components/video-sugestion";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { CommentView } from "@/modules/comments/components/view/comment-view";
import { CommentsSkeleton } from "@/modules/comments/components/ui/comments-skeleton";

interface Props {
  videoPlaybackId: string;
}
export const VideoView = async ({ videoPlaybackId }: Props) => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.comments.getMany.queryOptions({ videoPlaybackId })
  );

  return (
    <div className="flex flex-col mx-auto max-w-[1700px] mb-10 p-2">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <VideoSection videoPlaybackId={videoPlaybackId} />
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
        <SugestionSection />
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
