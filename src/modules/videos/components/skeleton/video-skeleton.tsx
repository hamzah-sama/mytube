import { Skeleton } from "@/components/ui/skeleton";

export const VideoSkeleton = () => {
  return (
    <div className="flex flex-col mx-auto max-w-[1700px] mb-10 p-2">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-[800px]">
          <div className="flex-1 min-w-0">
            <Skeleton className="w-full aspect-video rounded-xl " />
            <div className="p-2 flex flex-col gap-2">
              <Skeleton className="h-10 w-[500px]" />
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="size-12 rounded-full" />
                    <div className="flex flex-col gap-2 ">
                      <Skeleton className="h-5 w-30" />
                      <Skeleton className="h-5 w-25" />
                    </div>
                  </div>
                  <Skeleton className="w-30 h-7 rounded-full" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="w-40 h-10 rounded-full" />
                  <Skeleton className="size-10 rounded-full" />
                  <Skeleton className="size-10 rounded-full" />
                </div>
              </div>

              <div className="bg-accent flex flex-col rounded-xl py-4 px-2">
                <Skeleton className="w-30 h-5" />
                <Skeleton className="w-full h-50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VideoRowSkeleton = () => {
  return (
    <div className="flex flex-col w-[90%] gap-3 mb-10">
      {Array.from({ length: 3 }).map((_, index) => (
        <div className="p-2" key={index}>
          <div className="flex flex-col lg:flex-row gap-3 w-full">
            <div className="relative aspect-video w-full lg:w-[400px] shrink-0">
              <Skeleton className="w-full h-full rounded-xl" />
            </div>
            <div className="flex items-start justify-between w-full gap-2">
              <div className="flex flex-col flex-1 min-w-0 gap-2">
                <Skeleton className="w-full h-6 rounded-md" />
                <Skeleton className="w-1/2 h-4 rounded-md" />
                <div className="flex gap-2">
                  <Skeleton className="size-7 rounded-full shrink-0" />
                  <Skeleton className="w-1/4 h-4 rounded-md" />
                </div>
                <Skeleton className="w-full h-12 rounded-md" />
              </div>

              <Skeleton className="size-10 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const VideoColumnSkeleton = () => {
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
