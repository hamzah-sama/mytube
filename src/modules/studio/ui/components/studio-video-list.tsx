"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEFAULT_LIMIT } from "@/constant";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  userId: string;
}

export const StudioVideoList = ({ userId }: Props) => {
  const trpc = useTRPC();

  // Fetch semua data user
  const { data } = useSuspenseQuery(
    trpc.studio.getMany.queryOptions({ userId })
  );

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
  return (
    <div className="py-4 space-y-4">
      <div className="flex-flex-col gap-1 px-4">
      <h1 className='text-2xl font-bold'>Channel Content</h1>
      <p className="text-muted-foreground text-sm">Manage your content and videos</p>
      </div>
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
            <TableRow key={video.id}>
              <TableCell className="font-medium">{video.title}</TableCell>
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
    </div>
  );
};
