"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { ClapperboardIcon, UserCircleIcon } from "lucide-react";

export const AuthButton = () => {
  const trpc = useTRPC();
  const {data: userId} = useQuery(trpc.user.getUserId.queryOptions());
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <Button
            variant="outline"
            className="border-blue-700 rounded-full px-4 py-2 text-blue-700 hover:bg-blue-500 hover:border-none hover:text-white"
          >
            <UserCircleIcon />
            Sign in
          </Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton>
          <UserButton.MenuItems>
            <UserButton.Link
              label="Studio"
              href="/studio"
              labelIcon={<ClapperboardIcon className="size-4" />}
            />
            <UserButton.Link
              label="Profile"
              href={`users/${userId}`}
              labelIcon={<UserCircleIcon className="size-4" />}
            />
          </UserButton.MenuItems>
        </UserButton>
      </SignedIn>
    </>
  );
};
