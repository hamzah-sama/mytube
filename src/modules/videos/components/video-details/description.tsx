import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

interface Props {
  description?: string;
  createdAt: Date | string | number;
  totalViews: number;
}

export const VideoDescription = ({ description, createdAt, totalViews }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflow, setIsOverflow] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", { notation: "compact" }).format(totalViews);
  }, []);

  const expandedViews = useMemo(() => {
    return Intl.NumberFormat("en", { notation: "standard" }).format(totalViews);
  }, []);

  const compactDate = useMemo(() => {
    return formatDistanceToNow(createdAt, { addSuffix: true });
  }, [createdAt]);

  const expandedDate = useMemo(() => {
    return format(createdAt, "dd MMMM yyyy");
  }, [createdAt]);

  useLayoutEffect(() => {
    const el = descriptionRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      const style = getComputedStyle(el);
      const lineHeight = parseFloat(style.lineHeight);
      const maxHeight = lineHeight * 2;

      setIsOverflow(el.scrollHeight > maxHeight);
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      onClick={() => setIsExpanded((prev) => !prev)}
      className="bg-accent flex flex-col rounded-xl py-4 px-2 cursor-pointer"
    >
      <p className="font-medium text-base flex items-center gap-4">
        <span>{isExpanded ? expandedViews : compactViews} {totalViews > 1 ? "views" : "view"}</span>
        <span>{isExpanded ? expandedDate : compactDate}</span>
      </p>
      <div
        ref={descriptionRef}
        className={cn(!isExpanded && "line-clamp-2", "mb-5")}
      >
        {description}
      </div>

      {isOverflow && (
        <p className="flex items-center gap-2">
          <span>{isExpanded ? "See less" : "See more"}</span>
          {isExpanded ? (
            <ChevronUpIcon className="size-4" />
          ) : (
            <ChevronDownIcon className="size-4" />
          )}
        </p>
      )}
    </div>
  );
};
