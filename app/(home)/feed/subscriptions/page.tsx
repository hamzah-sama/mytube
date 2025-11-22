import { Skeleton } from "@/components/ui/skeleton";
import { SubscriptionsView } from "@/modules/subscriptions/ui/subscriptions-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Page = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.video.getVideoSubscriptions.queryOptions()
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary
        fallback={
          <div className="flex justify-center">Something went wrong</div>
        }
      >
        <Suspense fallback={<PageSkeleton />}>
          <SubscriptionsView />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  );
};

export default Page;

const PageSkeleton = () => {
  return (
    <div className="mx-auto max-w-[2400px] px-4 ">
      <h1 className="text-3xl font-bold">Subscriptions</h1>
      <p className="text-sm text-muted-foreground mb-5">
        Videos from your favorite creator
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-10">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="p-4 flex flex-col gap-3 w-full">
            <Skeleton className="w-full aspect-video rounded-lg" />
            <div className="flex gap-3">
              <Skeleton className="rounded-full size-12 shrink-0" />
              <div className="flex flex-col gap-2 w-full">
                <Skeleton className="w-[80%] h-6 rounded-md" />
                <Skeleton className="w-[70%] h-4 rounded-md" />
                <Skeleton className="w-[90%] h-4 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
