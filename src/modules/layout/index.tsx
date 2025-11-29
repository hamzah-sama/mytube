import { SidebarProvider } from "@/components/ui/sidebar";
import { LayoutNavbar } from "./components/navbar";
import { LayoutSidebar } from "./components/sidebar";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      <div className="w-full">
        <LayoutNavbar />
        <div className="flex min-h-screen pt-16">
          <LayoutSidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    // </SidebarProvider>
  );
};

export default Layout;
