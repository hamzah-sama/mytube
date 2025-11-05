import { db } from "@/db";
import { users } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

export const authRouter = createTRPCRouter({
  getUser: protectedProcedure.query(async ({ ctx }) => {
    const { clerkUserId } = ctx.auth;
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUserId));

    if (!user)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found in database",
      });
    return user;
  }),
});
