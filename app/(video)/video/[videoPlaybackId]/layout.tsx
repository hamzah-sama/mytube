import VideoLayout from "@/modules/layout";
interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return <VideoLayout>{children}</VideoLayout>;
};

export default Layout;
