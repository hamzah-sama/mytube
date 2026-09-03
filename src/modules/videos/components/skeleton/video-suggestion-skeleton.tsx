import { Skeleton } from "@/components/ui/skeleton";

export const VideoSuggestionSkeleton = () => {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 10 }).map((_, index) => (
        <div className="lg:w-full flex justify-between" key={index}>
          <div className="flex gap-2 flex-col lg:flex-row">
            <div className="relative aspect-video lg:w-40 w-70 shrink-0">
              <Skeleton className="w-full aspect-video rounded-xl " />
            </div>
            <div className="flex justify-between w-70">
              <div className="flex flex-col">
                <div className="flex flex-col max-w-50 gap-1">
                  <Skeleton className="h-7 w-30" />
                  <Skeleton className="h-3 w-30" />
                  <Skeleton className="h-3 w-30" />
                </div>
              </div>
              <Skeleton className="w-4 h-5 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
