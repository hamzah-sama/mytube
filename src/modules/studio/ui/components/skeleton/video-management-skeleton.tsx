import { Skeleton } from "@/components/ui/skeleton";

export const VideoManagementSkeleton = () => {
  return (
    <div>
      <div className="max-w-[1400px] px-4 pt-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Video details</h1>
            <h6 className="text-sm text-muted-foreground">
              Manage your video details
            </h6>
          </div>
          <Skeleton className="h-5 w-15" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 mt-5 space-x-5">
          <div className="col-span-3 flex flex-col space-y-10">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-xl" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-40 w-xl" />
            </div>
            <Skeleton className="h-30 w-44" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-xl" />
            </div>
          </div>
          <div className="col-span-2 flex flex-col gap-5 pb-5">
            <div className="bg-[#f9f9f9] rounded-md relative overflow-hidden space-y-5 pb-5 dark:bg-gray-800">
              <Skeleton className="h-52 w-full" />
              <div className="flex flex-col p-2 gap-2">
                <Skeleton className="h-5 w-20" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-[400px]" />
                  <Skeleton className="size-5" />
                </div>
              </div>
              <div className="flex flex-col p-2 gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="flex flex-col p-2 gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
            <div className="flex flex-col space-y-5">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
