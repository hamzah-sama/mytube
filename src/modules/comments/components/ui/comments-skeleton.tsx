import { Skeleton } from "@/components/ui/skeleton";

export const CommentsSkeleton = () => {
  return (
    <div className="p-2 flex flex-col gap-3 w-1200px">
      <Skeleton className="h-5 w-20" />
      <div className="flex flex-col space-y-4 w-full">
        <div className="flex items-center gap-4">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="w-full h-20" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="w-20 h-5" />
        </div>
      </div>

      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex flex-col w-full">
          <div className="py-5 flex justify-between w-full">
            <div className="flex space-x-4">
              <Skeleton className="size-12 rounded-full" />
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Skeleton className="h-7 w-30" />
                  <Skeleton className="h-5 w-40" />
                </div>
                <Skeleton className="h-8 w-150" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
