import { Skeleton } from "@/components/ui/skeleton";
import { CategoriesSection } from "@/modules/categories/ui/categories-section";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HomeVideoSection } from "../components/home-video-section";
import { Loader2Icon } from "lucide-react";

export const HomeView = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.categories.getMany.queryOptions());
  void queryClient.prefetchQuery(trpc.video.getMany.queryOptions());
  return (
    <div className="flex flex-col mx-auto max-w-[2400px] px-4 gap-4">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary fallback={<p className="flex justify-center animate-spin"><Loader2Icon /></p>}>
          <Suspense fallback={<CategorySectionSkeleton />}>
            <CategoriesSection />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary fallback={<p className="flex justify-center">Something went wrong</p>}>
          <Suspense fallback={<VideoSkeleton />}>
            <HomeVideoSection />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </div>
  );
};

const CategorySectionSkeleton = () => {
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

const VideoSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-10">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="p-4 flex flex-col gap-3 w-full" key={index}>
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
  );
};
