import {
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useTRPC } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { ChevronRightIcon, PlaySquareIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

export const SidebarUserSubscription = () => {
  const trpc = useTRPC();
  const pathName = usePathname();
  const { data } = useQuery(trpc.subscription.getCreators.queryOptions());

  const { isSignedIn } = useClerk();
  const clerk = useClerk();
  return (
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            tooltip="Subscriptions"
            isActive={pathName === "/feed/subscriptions"}
            onClick={(e) => {
              if (!isSignedIn) {
                e.preventDefault();
                toast.info("You need to be signed in to perform this action.");
                clerk.openSignIn();
              }
            }}
          >
            <Link
              href={"/feed/subscriptions"}
              className="flex items-center gap-4"
            >
              <PlaySquareIcon />
              <span className="inline-flex gap-2">
                Subscription
                <ChevronRightIcon className="size-4 translate-y-1" />
              </span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {data?.map((creator) => (
          <SidebarMenuItem key={creator.id}>
            <SidebarMenuButton
              asChild
              tooltip="Subscriptions"
              isActive={pathName === `/users/${creator.id}`}
            >
              <Link
                href={`/users/${creator.id}`}
                key={creator.id}
                className="flex items-center gap-4 p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md"
              >
                <div className="relative overflow-hidden size-6 rounded-full ">
                  <Image
                    alt={creator.name}
                    src={creator.imageUrl || "/user-placeholder.svg"}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <span>{creator.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  );
};
