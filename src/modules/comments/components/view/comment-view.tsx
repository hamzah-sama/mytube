"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CommentsForm } from "../ui/comments-form";
import { CommentsList } from "../ui/comments-list";
import { DEFAULT_LIMIT } from "@/constant";
import { useEffect, useRef, useState } from "react";
import { Loader2Icon } from "lucide-react";

interface Props {
  videoPlaybackId: string;
}

export const CommentView = ({ videoPlaybackId }: Props) => {
  const [visibleCounts, setVisibleCount] = useState(DEFAULT_LIMIT);
  const loaderRef = useRef<HTMLDivElement>(null);
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.comments.getMany.queryOptions({ videoPlaybackId })
  );

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      ([entries]) => {
        if (entries.isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(prev + DEFAULT_LIMIT, data.getComments.length)
          );
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [data.getComments.length]);

  const visibleComments = data.getComments.slice(0, visibleCounts);

  const isLoadingMore = visibleCounts < data.getComments.length;

  return (
    <div className="p-2 flex flex-col gap-3">
      <h1 className="font-bold text-xl">{data.getComments.length + data.getReplies.length} Comment</h1>
      <CommentsForm videoPlaybackId={videoPlaybackId} />
      <div>
        {visibleComments.map((comment, index) => (
          <CommentsList
            key={comment.id}
            data={data}
            index={index}
            videoPlaybackId={videoPlaybackId}
          />
        ))}
      </div>
      {isLoadingMore && (
        <div ref={loaderRef} className="flex items-center justify-center">
          <Loader2Icon className="size-4 animate-spin" />
        </div>
      )}
    </div>
  );
};
