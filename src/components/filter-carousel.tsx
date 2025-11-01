import Link from "next/link";
import { Badge } from "./ui/badge";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  data: { name: string; id: string }[];
  value?: string | null;
  onSelect?: (value: string | null) => void;
}

export const FilterCarousel = ({ data, value, onSelect }: Props) => {
  const [api, setApi] = useState<CarouselApi>();
  const [count, setCount] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "absolute left-10 w-10 top-0 bottom-0 z-10 bg-gradient-to-l from-primary/10 to-transparent dark:from-primary/20 pointer-events-none rounded-r-md",
          current === 1 && "hidden"
        )}
      />
      <Carousel
        setApi={setApi}
        opts={{
          dragFree: true,
          align: "start",
        }}
        className="w-full px-12"
      >
        <CarouselContent className="-ml-3">
          <CarouselItem className="pl-3 basis-auto">
            <Badge
              className="text-sm py-2 px-4 rounded-md"
              variant={value === null ? "default" : "secondary"}
              onClick={() => onSelect?.(null)}
            >
              All
            </Badge>
          </CarouselItem>
          {data.map((item) => (
            <CarouselItem key={item.id} className="pl-5 basis-auto">
              <Badge
                className="text-sm py-2 rounded-md"
                variant={value === item.id ? "default" : "secondary"}
                onClick={() => onSelect?.(item.id)}
              >
                <Link href={`/categories?category=${item.name}`}>
                  {item.name}
                </Link>
              </Badge>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 z-40" />
        <CarouselNext className="right-0 z-40" />
      </Carousel>
      <div
        className={cn(
          "absolute right-12 top-0 bottom-0 z-10 bg-gradient-to-r from-primary/10 to-transparent dark:from-primary/20 w-10 rounded-l-md pointer-events-none",
          current === count && "hidden"
        )}
      />
    </div>
  );
};
