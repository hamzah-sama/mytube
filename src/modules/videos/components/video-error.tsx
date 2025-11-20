import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  error?: any;
  reset?: () => void;
}

export const VideoError = ({ error, reset }: Props) => {
  const isNotFound =
    error?.data?.code === "NOT_FOUND" ||
    error?.message?.toLowerCase().includes("not found");

  return (
    <div className="w-full flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>

      <p className="text-muted-foreground mb-6">
        The video you're looking for doesn't exist or has been removed.
      </p>

      <Link href="/" className="inline-flex items-center gap-2">
        <ArrowLeftIcon className="size-4" />
        <span>Go back</span>
      </Link>
    </div>
  );
};
