import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";

interface Props{
    userId: string
    children: React.ReactNode
}

export const UserDetails = ({userId, children} : Props) => {
    const trpc = useTRPC()
  const { data } = useSuspenseQuery(trpc.user.getOne.queryOptions({ userId }));

  return (
    <div className="flex gap-4">
      <div className="relative rounded-full overflow-hidden size-36">
        <Image
          src={data?.imageUrl ?? '/user-placeholder.svg'}
          alt={data?.name ?? 'user'}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold">{data?.name}</h1>
        <p className="flex gap-1 items-center text-base">
          <span className="font-semibold">
            @
            {data?.name
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join("")}
          </span>
          <span className="text-muted-foreground text-xs">•</span>
          <span className="text-muted-foreground">
            {Intl.NumberFormat("en", { notation: "standard" }).format(
              data?.subscribersCount
            )}{" "}
            {data?.subscribersCount <= 1 ? "subscriber" : "subscribers"}
          </span>
          <span className="text-muted-foreground text-xs">•</span>
          <span className="text-muted-foreground">
            {data?.totalVideos} {data?.totalVideos <= 1 ? "video" : "videos"}
          </span>
        </p>
        {children}
      </div>
    </div>
  );
};
