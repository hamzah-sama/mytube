import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { PUBLIC_URL } from "@/constant";
import { CopyCheckIcon, CopyIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  playbackId: string | null;
}
export const VideoLinkField = ({ playbackId }: Props) => {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(`${PUBLIC_URL}/video/${playbackId}`);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };
  return (
    <div className="flex flex-col p-2">
      <p className="text-sm text-muted-foreground">Video link</p>

      <div className="flex items-center justify-between">
        <p
          onClick={() => router.push(`${PUBLIC_URL}/video/${playbackId}`)}
          className="max-w-[450px] block truncate text-blue-500 hover:underline cursor-pointer"
        >
          {`${PUBLIC_URL}/video/${playbackId}`}
        </p>
        <Hint text="Copy link" side="bottom" align="end">
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={handleCopy}
          >
            {isCopied ? <CopyCheckIcon /> : <CopyIcon />}
          </Button>
        </Hint>
      </div>
    </div>
  );
};
