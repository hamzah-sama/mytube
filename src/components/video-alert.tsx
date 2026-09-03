import { AlertTriangleIcon } from "lucide-react";

export const VideoAlert = () => {
  return (
    <div className="flex items-center gap-6 bg-yellow-400 text-black p-4 rounded-b-xl">
      <AlertTriangleIcon />
      <p className="text-base font-medium">This video is still being processed</p>
    </div>
  );
};
