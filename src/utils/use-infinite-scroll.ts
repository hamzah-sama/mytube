import { DEFAULT_LIMIT } from "@/constant";
import { useEffect, useRef, useState } from "react";

interface Options {
  total: number; // total items
  limit?: number; // increment per scroll
  rootMargin?: string;
}

export function useInfiniteScroll({
  total,
  limit = DEFAULT_LIMIT,
  rootMargin = "200px",
}: Options) {
  const [visibleCount, setVisibleCount] = useState(limit);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount((prev) => Math.min(prev, total));
  }, [total]);

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + limit, total));
        }
      },
      { rootMargin }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [total, limit, rootMargin]);

  const isLoadingMore = visibleCount < total;

  return {
    visibleCount,
    loaderRef,
    isLoadingMore,
  };
}
