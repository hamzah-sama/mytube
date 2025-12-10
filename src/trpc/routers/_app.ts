import { authRouter } from "@/modules/auth/server/procedures";
import { createTRPCRouter } from "../init";
import { categoriesRouter } from "@/modules/categories/server/procedures";
import { studioProcedures } from "@/modules/studio/server/procedures";
import { videoRouter } from "@/modules/videos/server/procedures";
import { ViewCountRouter } from "@/modules/view-and-history/view-count/procedures";
import { reactionRouter } from "@/modules/videos-reaction/server/procedures";
import { commentsRouter } from "@/modules/comments/server/procedures";
import { commentsReactionRouter } from "@/modules/comments-reaction/server/procedures";
import { subscriptionsRouter } from "@/modules/subscriptions/procedures";
import { historyRouter } from "@/modules/view-and-history/history/server/procedures";
import { playlistRouter } from "@/modules/playlist/server/procedures";
import { userRouter } from "@/modules/user/server/procedures";
export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  auth: authRouter,
  user: userRouter,
  studio: studioProcedures,
  video: videoRouter,
  viewCount: ViewCountRouter,
  subscription: subscriptionsRouter,
  videoReaction: reactionRouter,
  comments: commentsRouter,
  commentsReaction: commentsReactionRouter,
  history: historyRouter,
  playlist: playlistRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
