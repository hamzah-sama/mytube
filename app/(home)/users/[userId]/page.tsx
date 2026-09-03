import { Skeleton } from "@/components/ui/skeleton";
import { UserView } from "@/modules/user/ui/view/user-view";
import { VideoError } from "@/modules/videos/components/video-error";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  params: Promise<{ userId: string }>;
}

const Page = async ({ params }: Props) => {
  const { userId } = await params;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.user.getOne.queryOptions({ userId }));
  void queryClient.prefetchQuery(
    trpc.user.getManyVideos.queryOptions({ userId })
  );
  void queryClient.prefetchQuery(
    trpc.user.getManyPlaylist.queryOptions({ userId })
  );
  return (
    <div className="mx-auto max-w-[1200px]">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary fallback={<VideoError />}>
          <Suspense fallback={<PageSkeleton />}>
            <UserView userId={userId} />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </div>
  );
};

export default Page;

const PageSkeleton = () => {
  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-[200px] w-full bg-muted-foreground rounded-xl" />
        <div className="flex gap-4">
          <Skeleton className="rounded-full size-36" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 " />
          <Skeleton className="h-5 w-16 " />
        </div>
      </div>
    </div>
  );
};
