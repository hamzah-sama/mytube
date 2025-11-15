import { inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "./trpc/routers/_app";

export type categoriesType = inferProcedureOutput<AppRouter["categories"]["getMany"]>
export type videoDetailsType = inferProcedureOutput<AppRouter['video']['getOne']>