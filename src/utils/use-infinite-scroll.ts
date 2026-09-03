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
  const [visibleCount, setVisibleCount] = useState<number>(limit);
  const [loaderElement, setLoaderElement] = useState<HTMLDivElement | null>(
    null,
  );

  useEffect(() => {
    setVisibleCount(limit);
  }, [total, limit]);

  useEffect(() => {
    if (!loaderElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + limit, total));
        }
      },
      { rootMargin },
    );

    observer.observe(loaderElement);
    return () => observer.disconnect();
  }, [total, limit, rootMargin, loaderElement]);

  const isLoadingMore = visibleCount < total;

  return {
    visibleCount,
    loaderRef: setLoaderElement,
    isLoadingMore,
  };
}
