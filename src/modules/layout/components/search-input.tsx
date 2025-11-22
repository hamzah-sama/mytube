import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

export const SearchInput = () => {
  return (
    <form className="flex w-full max-w-[600px]">
      <div
        className="
        relative w-full flex items-center
        "
      >
        <Input
          className="w-full rounded-l-full pr-10 pl-5 py-2 focus:outline-none border-r-0 "
          placeholder="Search"
        />
        <Button
          variant="default"
          type="submit"
          className="border-l-0 rounded-r-full bg-gray-100 dark:bg-gray-700 text-foreground hover:bg-gray-200 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SearchIcon />
        </Button>
      </div>
    </form>
  );
};
