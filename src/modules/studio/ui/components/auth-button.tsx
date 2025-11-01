"use client";

import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import {
  ClapperboardIcon,
  UserCircleIcon,
} from "lucide-react";

import { useTheme } from "next-themes";

export const AuthButton = () => {
  const { setTheme, theme } = useTheme();
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
          </UserButton.MenuItems>
        </UserButton>
      </SignedIn>
    </>
  );
};
