import StudioLayout from "@/modules/studio/ui/layout";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return <StudioLayout>{children}</StudioLayout>;
};

export default Layout;
