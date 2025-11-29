import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function getUserId() {
  const { userId } = await auth();

  if (!userId) return null;

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, userId));

  if (!user.id) throw new Error("could not find user");

  return user.id;
}
