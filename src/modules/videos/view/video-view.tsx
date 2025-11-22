import { CommentsSkeleton } from "@/modules/comments/components/ui/comments-skeleton";
import { CommentView } from "@/modules/comments/components/view/comment-view";
import { VideoError } from "@/modules/videos/components/video-error";
import { VideoSection } from "@/modules/videos/components/video-section";
import { VideoSkeleton } from "@/modules/videos/components/skeleton/video-skeleton";
import { SugestionSection } from "@/modules/videos/components/video-sugestion";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { VideoSuggestionSkeleton } from "../components/skeleton/video-suggestion-skeleton";

interface Props {
  videoPlaybackId: string;
}

export const VideoView = ({ videoPlaybackId }: Props) => {
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
  );
};
