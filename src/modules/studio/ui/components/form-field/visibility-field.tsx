import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlobeIcon, LockIcon } from "lucide-react";
import { Control, FieldValues } from "react-hook-form";

interface Props{
    control : Control<FieldValues, any, FieldValues> | undefined
}

export const VisibilityField = ({control} : Props) => {
  return (
    <FormField
      name="visibility"
      control={control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Visibility</FormLabel>
          <FormControl>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value ?? ""}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select visibility" />
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
  );
};
