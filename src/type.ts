import { inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "./trpc/routers/_app";

export type categoriesType = inferProcedureOutput<
  AppRouter["categories"]["getMany"]
>;
export type videoDetailsType = inferProcedureOutput<
  AppRouter["video"]["getOne"]
>;
export type commentType = inferProcedureOutput<
  AppRouter["comments"]["getMany"]
>;
export type replyType = inferProcedureOutput<AppRouter["comments"]["getMany"]>['getReplies'][number]


// export type replyType = inferProcedureOutput<AppRouter['commentsReplies']['getMany']>
