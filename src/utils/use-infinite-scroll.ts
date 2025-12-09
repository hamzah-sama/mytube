import { DEFAULT_LIMIT } from "@/constant";
import { useEffect, useRef, useState } from "react";

interface Options {
  total: number; // total items
  limit?: number; // increment per scroll
  rootMargin?: string;
  enabled?: boolean;
}

export function useInfiniteScroll({
  total,
  enabled = true,
  limit = DEFAULT_LIMIT,
  rootMargin = "200px",
}: Options) {
  const [visibleCount, setVisibleCount] = useState(limit);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [loaderElement, setLoaderElement] = useState<HTMLDivElement | null>(
    null
  );

  const setRefs = (element: HTMLDivElement | null) => {
    loaderRef.current = element;
    setLoaderElement(element);
  };

  useEffect(() => {
    setVisibleCount((prev) => Math.min(prev, total));
  }, [total]);

  useEffect(() => {
    if (!enabled) return;
    if (!loaderElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + limit, total));
        }
      },
      { rootMargin }
    );

    observer.observe(loaderElement);
    return () => observer.disconnect();
  }, [total, limit, rootMargin, enabled, loaderElement]);

  const isLoadingMore = visibleCount < total;

  return {
    visibleCount,
    loaderRef: setRefs,
    isLoadingMore,
  };
}
