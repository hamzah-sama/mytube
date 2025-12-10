"use client";

import {
  ChevronRightIcon,
  FlameIcon,
  HistoryIcon,
  HomeIcon,
  ListVideoIcon,
  ThumbsUpIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useAuth, useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { SidebarUserSubscription } from "@/modules/user/ui/components/sidebar-user-subscription";
import { usePathname } from "next/navigation";

// Menu items.
const mainItems = [
  {
    title: "Home",
    url: "/",
    icon: HomeIcon,
  },
  {
    title: "Trending",
    url: "/feed/trending",
    icon: FlameIcon,
  },
];
const PersonalItems = [
  {
    title: "History",
    url: "/playlist/history",
    icon: HistoryIcon,
    auth: true,
  },
  {
    title: "Liked videos",
    url: "/playlist/liked",
    icon: ThumbsUpIcon,
    auth: true,
  },
  {
    title: "All playlists",
    url: "/playlist",
    icon: ListVideoIcon,
    auth: true,
  },
];

export const LayoutSidebar = () => {
  const { isSignedIn } = useAuth();
  const clerk = useClerk();
  const pathName = usePathname()
  return (
    <Sidebar collapsible="icon" className="pt-16 z-40 border-none">
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathName === item.url}
                  >
                    <Link href={item.url} className="flex items-center gap-4">
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
          <SidebarSeparator className="my-2" />
          <SidebarUserSubscription />
          <SidebarSeparator className="my-2" />
          <SidebarGroupLabel className="text-muted-foreground">
            You
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {PersonalItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathName == item.url}
                    onClick={(e) => {
                      if (!isSignedIn && item.auth) {
                        e.preventDefault();
                        toast.info(
                          "You need to be signed in to access this section."
                        );
                        return clerk.openSignIn();
                      }
                    }}
                  >
                    <Link href={item.url} className="flex items-center gap-4">
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
