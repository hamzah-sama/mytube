import { Skeleton } from "@/components/ui/skeleton";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HomeVideosSection } from "@/modules/home/ui/components/home-video-section";

export const HomeView = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.categories.getMany.queryOptions());
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary
        fallback={
          <p className="flex justify-center text-muted-foreground">
            Something went wrong
          </p>
        }
      >
        <Suspense fallback={<CategorySectionSkeleton />}>
          <HomeVideosSection />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  );
};

export const CategorySectionSkeleton = () => {
  return (
    <div className="flex items-center gap-4 px-10 overflow-hidden">
      {Array.from({ length: 15 }).map((_, index) => (
        <div key={index}>
          <Skeleton className="w-28 h-7 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
        </div>
      ))}
    </div>
  );
};
