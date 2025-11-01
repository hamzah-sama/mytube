import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { ExternalLinkIcon, Video } from "lucide-react";
import { SidebarHeaderSkeleton, StudioSidebarHeader } from "./studio-sidebar-header";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

export const StudioSidebar = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.auth.getUser.queryOptions());
  return (
    <Sidebar
      collapsible="icon"
      className="pt-16 z-40 border bg-background group"
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Suspense fallback={<SidebarHeaderSkeleton />}>
            <StudioSidebarHeader />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>

      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    href="#"
                    className="flex items-center gap-4 bg-gray-100 dark:bg-gray-700"
                  >
                    <Video />
                    <span>Content</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarSeparator />
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/" className="flex items-center gap-4">
                    <ExternalLinkIcon />
                    <span>Exit studio</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
