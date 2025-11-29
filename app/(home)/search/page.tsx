import { Skeleton } from "@/components/ui/skeleton";
import { SearchView } from "@/modules/home/ui/view/search-view";
import { VideoRowSkeleton } from "@/modules/videos/components/skeleton/video-skeleton";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  searchParams: Promise<{
    query: string;
  }>;
}

const Page = async ({ searchParams }: Props) => {
  const { query } = await searchParams;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.video.search.queryOptions({ query }));
  return (
    <div className="flex flex-col mx-auto max-w-[2400px] px-4 gap-4">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary
          fallback={
            <p className="text-center text-muted-foreground">
              Something went wrong
            </p>
          }
        >
          <Suspense fallback={<SearchSkeleton query={query} />}>
            <SearchView query={query} />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </div>
  );
};

export default Page;

const SearchSkeleton = ({ query }: { query: string }) => {
  return (
    <>
      <h1 className="text-lg font-bold text-left">
        Search results for "{query}"
      </h1>
      <VideoRowSkeleton />
    </>
  );
};
