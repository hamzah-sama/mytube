import { getUserId } from "@/lib/get-user";
import { StudioVideoList } from "@/modules/studio/ui/components/studio-video-list";
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
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        <Suspense fallback={<div>Loading...</div>}>
          <StudioVideoList userId={userId} />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  );
};

export default Page;
