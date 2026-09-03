import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { PUBLIC_URL } from "@/constant";
import { videoDetailsType } from "@/type";
import { CopyCheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

interface Props {
  video: videoDetailsType;
}

export const CopyButton = ({ video }: Props) => {
  const [isCopied, setIsCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(`${PUBLIC_URL}/video/${video.muxPlaybackId}`);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };
  return (
    <Hint text="Copy link" side="bottom">
      <Button
        variant="secondary"
        disabled={isCopied}
        className="rounded-full bg-accent p-3"
        onClick={handleCopy}
      >
        {isCopied ? (
          <CopyCheckIcon className="size-5" />
        ) : (
          <CopyIcon className="size-5" />
        )}
      </Button>
    </Hint>
  );
};
