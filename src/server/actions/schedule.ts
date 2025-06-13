import { db } from "@/drizzle/db";
import { ScheduleAvailabilitiesTable, ScheduleTable } from "@/drizzle/schema";
import { scheduleFormSchema } from "@/schema/schedule";
import { auth } from "@clerk/nextjs/server";
import { error } from "console";
import { eq } from "drizzle-orm";
import { BatchItem } from "drizzle-orm/batch";
import { z } from "zod";


export async function saveSchedule(unsafeData: z.infer<typeof scheduleFormSchema>){
   
    const {userId} = await auth()
    const {success, data} = scheduleFormSchema.safeParse(unsafeData)

    if(!success || userId == null){
        return {error: true}
    }

    const {availabilities, ...scheduledData} = data

    const [{id: scheduleId}] = await db.insert(ScheduleTable).values({...scheduledData, clerkUserId: userId}).onConflictDoUpdate({
        target: ScheduleTable.clerkUserId,
        set: scheduledData,
    })
    .returning({id: ScheduleTable.id})

    const statements: [BatchItem<"pg">]= [
        db.delete(ScheduleAvailabilitiesTable).where(eq(ScheduleAvailabilitiesTable.scheduleId, scheduleId))
    ]

    if(availabilities.length > 0){
         statements.push(
      db.insert(ScheduleAvailabilitiesTable).values(
        availabilities.map(availability => ({
          ...availability,
          dayOfweek: availability.dayOfWeek,
          scheduleId,
        }))
      )
    )
    }

      await db.batch(statements)
}