import { Skeleton } from "@/components/ui/skeleton";
import { CategoriesSection } from "@/modules/categories/ui/categories-section";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const HomeView = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.categories.getMany.queryOptions());
  return (
    <div className="flex flex-col mx-auto max-w-[2400px] px-4">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <Suspense fallback={<CategorySectionSkeleton />}>
            <CategoriesSection />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </div>
  );
};

const CategorySectionSkeleton = () => {
  return (
    <div className="flex items-center gap-4 px-10">
      {Array.from({ length: 15 }).map((_, index) => (
        <div key={index}>
          <Skeleton className="w-28 h-7 bg-gray-200 animate-pulse rounded-md" />
        </div>
      ))}
    </div>
  );
};
