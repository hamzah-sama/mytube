import Image from "next/image";
import Link from "next/link";
import { SearchInput } from "./search-input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AuthButton } from "@/modules/auth/ui/auth-button";
import { ThemeToggle } from "@/components/theme/themeToggle";

export const LayoutNavbar = () => {
  return (
    <nav className="fixed top-0 right-0 left-0 w-full flex items-center h-16 px-4 pr-5 bg-background z-50">
      <div className="flex items-center w-full gap-4">
        <div className="flex items-center shrink-0 ">
          <SidebarTrigger />
          <Link href="/" className="flex items-center gap-1 p-4">
            <Image src="/logo.svg" alt="Logo" width={32} height={32} />
            <span className="text-xl font-bold tracking-tight -translate-y-0.5">
              Mytube
            </span>
          </Link>
        </div>

        <div className="flex items-center w-full max-w-[720px] flex-1 mx-auto">
          <SearchInput />
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};
