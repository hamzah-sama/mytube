import { authRouter } from "@/modules/auth/server/procedures";
import { createTRPCRouter } from "../init";
import { categoriesRouter } from "@/modules/categories/server/procedures";
import { studioProcedures } from "@/modules/studio/server/procedures";
import { videoRouter } from "@/modules/videos/server/procedures";
import { ViewCountRouter } from "@/modules/view-count/procedures";
import { subscribersCountRouter } from "@/modules/subscriber-count/procedures";
import { reactionRouter } from "@/modules/videos-reaction/procedures";
import { commentsRouter } from "@/modules/comments/server/procedures";
import { commentsReactionRouter } from "@/modules/comments-reaction/server/procedures";
export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  auth: authRouter,
  studio: studioProcedures,
  video: videoRouter,
  viewCount: ViewCountRouter,
  subscriberCount: subscribersCountRouter,
  reactionCount: reactionRouter,
  comments: commentsRouter,
  commentsReaction: commentsReactionRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
