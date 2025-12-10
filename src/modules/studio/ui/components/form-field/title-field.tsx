import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SparklesIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Control, FieldValues, useFormContext } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  control: Control<FieldValues, any, FieldValues> | undefined;
  videoId: string;
  value?: string;
}
export const TitleField = ({ control, videoId, value }: Props) => {
  const queryClient = useQueryClient();
  const [isgenerateTitle, setIsgenerateTitle] = useState(false);
  const trpc = useTRPC();
  const generateTitle = useMutation(
    trpc.studio.generateTitle.mutationOptions({
      onSuccess: () => {
        setIsgenerateTitle(true);
        toast.info("Title generated processing...");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const { data: title } = useQuery(
    trpc.studio.getTitleWorkFlow.queryOptions(
      { videoId },
      {
        enabled: isgenerateTitle,
        refetchInterval: 3000,
      }
    )
  );

  useEffect(() => {
    if (title?.status !== "success") return;
    if (title?.status === "success") {
      setIsgenerateTitle(false);
      queryClient.invalidateQueries(trpc.studio.getMany.queryOptions());
      queryClient.invalidateQueries(
        trpc.studio.getOne.queryOptions({ videoId })
      );
      toast.success("successfully generate title");
    }
  }, [title?.status]);

  const { setValue } = useFormContext();

  useEffect(() => {
    if (value) {
      setValue("title", value);
    }
  }, [value, setValue]);

  return (
    <FormField
      name="title"
      control={control}
      render={({ field }) => (
        <FormItem
          className={cn(isgenerateTitle && "cursor-not-allowed opacity-20")}
        >
          <div className="flex items-center gap-5">
            <FormLabel>Title</FormLabel>
            <Hint side="right" text="AI-generate">
              <Button
                variant="ghost"
                disabled={generateTitle.isPending}
                size="icon"
                type="button"
                onClick={() => generateTitle.mutate({ videoId })}
              >
                <SparklesIcon className="size-4" />
              </Button>
            </Hint>
          </div>
          <FormControl>
            <Input
              {...field}
              placeholder="Add a title to your video"
              disabled={isgenerateTitle}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
