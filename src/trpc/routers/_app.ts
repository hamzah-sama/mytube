import { authRouter } from "@/modules/auth/server/procedures";
import { createTRPCRouter } from "../init";
import { categoriesRouter } from "@/modules/categories/server/procedures";
import { studioProcedures } from "@/modules/studio/server/procedures";
import { videoRouter } from "@/modules/videos/server/procedures";
export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  auth: authRouter,
  studio: studioProcedures,
  video: videoRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;
