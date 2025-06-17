"use server";

import { db } from "@/drizzle/db";
import { getValidateTimeFromSchedule } from "@/lib/getValidateTimeFromSchedule";
import { meetingActionSchema } from "@/schema/meetings";
import { fromZonedTime } from "date-fns-tz";
import { z } from "zod";
import { createCalendarEvent } from "../googleCalender";
import { redirect } from "next/navigation";

export async function createMeeting(
  unSafeData: z.infer<typeof meetingActionSchema>
) {
  const { success, data } = meetingActionSchema.safeParse(unSafeData);

  if (!success) return { error: true };

  const event = await db.query.EventTable.findFirst({
    where: ({ clerkUserId, isActive, id }, { eq, and }) =>
      and(
        eq(isActive, true),
        eq(clerkUserId, data.clerkUserId),
        eq(id, data.eventId)
      ),
  });

  if (event == null) return { error: true };
  const startInTimezone = fromZonedTime(data.startTime, data.timezone);

  const validTimes = await getValidateTimeFromSchedule([startInTimezone], event)
  if (validTimes.length === 0) return { error: true };
   await createCalendarEvent({
    ...data,
    startTime: startInTimezone,
    durationInMinutes: event.durationInMinutes,
    eventName: event.name,
  })

  redirect(
    `/book/${data.clerkUserId}/${
      data.eventId
    }/success?startTime=${data.startTime.toISOString()}`
  )
}
