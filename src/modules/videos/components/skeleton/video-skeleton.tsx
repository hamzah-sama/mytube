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
