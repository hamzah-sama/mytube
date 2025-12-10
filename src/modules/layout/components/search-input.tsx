"use client";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const SearchInput = () => {
  const [value, setValue] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = new URL("/search", window.location.origin);
    const newQuery = value.trim();

    url.searchParams.set("query", newQuery);

    router.push(url.toString());
  };
  return (
    <form className="flex w-full max-w-[600px]" onSubmit={handleSearch}>
      <div
        className="
        relative w-full flex items-center
        "
      >
        <Input
          className="w-full rounded-l-full pr-10 pl-5 py-2 focus:outline-none border-r-0 relative "
          placeholder="Search"
          onChange={(e) => setValue(e.target.value)}
          value={value}
        />
        {value.trim() !== "" && (
          <Hint text="clear">
            <Button
              className="absolute right-10 top-0 text-gray-400 hover:bg-transparent"
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => setValue("")}
            >
              <XIcon className="size-4" />
            </Button>
          </Hint>
        )}
        <Button
          disabled={value.trim() === ""}
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
