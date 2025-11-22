import Image from "next/image";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AuthButton } from "@/components/auth-button";
import { ThemeToggle } from "@/components/theme/themeToggle";
import { CreateVideoButton } from "./create-video-button";

export const StudioNavbar = async () => {
  return (
    <nav className="fixed top-0 right-0 left-0 w-full flex items-center h-16 px-4 pr-10 bg-background z-50 border-b shadow-sm">
      <div className="flex items-center w-full gap-4">
        <div className="flex items-center shrink-0 ">
          <SidebarTrigger />
          <Link href="/studio" className="flex items-center gap-1 p-4">
            <Image src="/logo.svg" alt="Logo" width={32} height={32} />
            <span className="text-xl font-bold tracking-tight -translate-y-0.5">
              Studio
            </span>
          </Link>
        </div>

        <div className=" flex-1 " />

        <div className="flex items-center gap-4 shrink-0">
          <ThemeToggle />
          <CreateVideoButton/>
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};
