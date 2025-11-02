"use client";

import { createTRPCReact } from "@trpc/react-query";
import { AppRouter } from "./routers/_app";

export const trpc = createTRPCReact<AppRouter>();
