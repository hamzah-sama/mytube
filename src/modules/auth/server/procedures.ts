import { db } from "@/db";
import { users } from "@/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { eq } from "drizzle-orm";

export const authRouter = createTRPCRouter({
  getUser: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.auth;
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId));
    return user;
  }),
});
