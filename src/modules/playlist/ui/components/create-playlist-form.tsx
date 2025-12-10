import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { visibility } from "@/db/schema";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GlobeIcon, Loader2Icon, LockIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  setOpenModal: (open: boolean) => void;
}

export const CreatePlaylistForm = ({ setOpenModal }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const formSchema = z.object({
    name: z.string().min(1, "name is required"),
    visibility: z.enum(["public", "private"]),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      visibility: "private",
    },
  });

  const create = useMutation(
    trpc.playlist.create.mutationOptions({
      onSuccess: () => {
        form.reset();
        setOpenModal(false);
        queryClient.invalidateQueries(trpc.playlist.getMany.queryOptions());
        toast.info("Playlist created");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    create.mutate(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <Input {...field} placeholder="write a name for the playlist" />
            </FormItem>
          )}
        />
        <FormField
          name="visibility"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visibility</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value ?? ""}
                >
                  <SelectTrigger className="w-[400px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <GlobeIcon className="mr-2 size-4" />
                      Public
                    </SelectItem>
                    <SelectItem value="private">
                      <LockIcon className="mr-2 size-4" />
                      Private
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-5">
          <Button disabled={create.isPending} type="submit">
            {create.isPending ? (
              <p className="flex items-center gap-2">
                <Loader2Icon className="animate-spin" />
                Creating...
              </p>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
