import { getUserId } from "@/lib/get-user";
import {
  StudioVideoList,
  StudioVideoListSkeleton,
} from "@/modules/studio/ui/components/studio-video-list";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Page = async () => {
  const userId = await getUserId();

  if (!userId) throw new Error("user not found");

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.studio.getMany.queryOptions({ userId }));

  return (
    <div className="py-4 space-y-4">
      <div className="flex-flex-col gap-1 px-4">
        <h1 className="text-2xl font-bold">Channel Content</h1>
        <p className="text-muted-foreground text-sm">
          Manage your content and videos
        </p>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <Suspense fallback={<StudioVideoListSkeleton />}>
            <StudioVideoList userId={userId} />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </div>
  );
};

export default Page;
