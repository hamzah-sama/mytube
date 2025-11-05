"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VideoThumbnail } from "@/components/video-thumbnail";
import { DEFAULT_LIMIT } from "@/constant";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export const StudioVideoList = () => {
  const trpc = useTRPC();
  const router = useRouter();

  // Fetch semua data user
  const { data } = useSuspenseQuery(trpc.studio.getMany.queryOptions());

  const [visibleCount, setVisibleCount] = useState(DEFAULT_LIMIT);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      ([entries]) => {
        if (entries.isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(prev + DEFAULT_LIMIT, data.length)
          );
        }
      },
      { rootMargin: "200px" } // mulai load 200px sebelum muncul
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [data.length]);

  const visibleVideos = data.slice(0, visibleCount);

  const isLoadingMore = visibleCount < data.length;

  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center py-6">
        <p className="text-muted-foreground">No videos found in your channel</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100/30 border-none">
            <TableHead className="pl-6 w-[750px]">Video</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead>status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Views</TableHead>
            <TableHead className="text-right">Comments</TableHead>
            <TableHead className="text-right pr-6">Likes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleVideos.map((video) => (
            <TableRow
              key={video.id}
              onClick={() => router.push(`/studio/video/${video.id}`)}
              className="cursor-pointer"
            >
              <TableCell className="pl-6 font-medium w-[750px]">
                <div className="flex gap-4">
                  <div className="relative aspect-video w-36 shrink-0">
                    <VideoThumbnail
                      thumbnail={video.thumbnailUrl}
                      preview={video.previewUrl}
                      duration={video.duration}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium line-clamp-1">
                      {video.title}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {video.description || "No description"}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="capitalize">{video.visibility}</TableCell>
              <TableCell className="capitalize">{video.muxStatus}</TableCell>
              <TableCell className="text-sm truncate">
                {video.createdAt && format(video.createdAt, "dd MMMM yyyy")}
              </TableCell>
              <TableCell className="text-right">Views</TableCell>
              <TableCell className="text-right">Comments</TableCell>
              <TableCell className="text-right pr-6">Likes</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Loader sentinel */}
      {isLoadingMore && (
        <div ref={loaderRef} className="flex justify-center py-6">
          <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </>
  );
};

export const StudioVideoListSkeleton = () => {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100/30 border-none">
            <TableHead className="pl-6 w-[750px]">Video</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead>status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Views</TableHead>
            <TableHead className="text-right">Comments</TableHead>
            <TableHead className="text-right pr-6">Likes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell className="pl-6 w-[750px]">
                <div className="flex item-center gap-4">
                  <div className="relative aspect-video w-36">
                    <Skeleton className="w-full h-full" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Skeleton className="w-36 h-5" />
                    <Skeleton className="w-36 h-3" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="w-20 h-5" />
              </TableCell>
              <TableCell>
                <Skeleton className="w-20 h-5" />
              </TableCell>
              <TableCell>
                <Skeleton className="w-20 h-5" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="w-20 h-5" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="w-20 h-5" />
              </TableCell>
              <TableCell className="text-right pr-6">
                <Skeleton className="w-20 h-5" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};
