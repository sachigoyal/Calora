"use server";
import { z } from "zod";
import { eventFormSchema } from "@/schema/events";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/drizzle/db";
import { redirect } from "next/navigation";
import { EventTable } from "@/drizzle/schema";

export async function createEvent(
  unsafeData: z.infer<typeof eventFormSchema>
): Promise<{ error: boolean } | undefined> {
  const { userId } = await auth();
  const { success, data } = eventFormSchema.safeParse(unsafeData);

  if (!success || userId == null) {
    return { error: true };
  }

  await db.insert(EventTable).values({ ...data, clerkUserId: userId });
  redirect("/events");
}
