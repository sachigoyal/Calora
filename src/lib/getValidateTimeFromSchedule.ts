import { DAYS_OF_WEEK_IN_ORDER } from "@/data/constants";
import { db } from "@/drizzle/db";
import { ScheduleAvailabilitiesTable } from "@/drizzle/schema";
import { getCalendarEventTimes } from "@/server/googleCalender";
import { addMinutes, areIntervalsOverlapping, isFriday, isMonday, isSaturday, isSunday, isThursday, isTuesday, isWednesday, isWithinInterval, setHours, setMinutes } from "date-fns";
import { fromZonedTime } from "date-fns-tz"


export async function getValidateTimeFromSchedule(
  timesInOrder: Date[],
  event: { clerkUserId: string; durationInMinutes: number }
) {
  const start = timesInOrder[0];
  console.log("Start time:", start);
  const end = timesInOrder.at(-1);
  console.log("End time:", end);

  if (start == null || end == null) return [];

  const schedule = await db.query.ScheduleTable.findFirst({
    where: ({ clerkUserId: userColId }, { eq }) =>
      eq(userColId, event.clerkUserId),
    with: { availabilities: true },
  });
  console.log("Schedule:", schedule);

  if (schedule == null) return [];

  const groupedAvailabilities = Object.groupBy(
    schedule.availabilities,
    a => a.dayOfWeek
  );
  console.log("Grouped availabilities:", groupedAvailabilities);

  const eventTimes = await getCalendarEventTimes(event.clerkUserId, {
    start,
    end,
  })

  return timesInOrder.filter(intervalDate => {
    const availabilities = getAvailabilities(
      groupedAvailabilities,
      intervalDate,
      schedule.timezone
    )
    const eventInterval = {
      start: intervalDate,
      end: addMinutes(intervalDate, event.durationInMinutes),
    }

    return (
      eventTimes.every(eventTime => {
        return !areIntervalsOverlapping(eventTime, eventInterval)
      }) &&
      availabilities.some(availability => {
        return (
          isWithinInterval(eventInterval.start, availability) &&
          isWithinInterval(eventInterval.end, availability)
        )
      })
    )
  })
}


function getAvailabilities(
  groupedAvailabilities: Partial<
    Record<
      (typeof DAYS_OF_WEEK_IN_ORDER)[number],
      (typeof ScheduleAvailabilitiesTable.$inferSelect)[]
    >
  >,
  date: Date,
  timezone: string
) {
  let availabilities:
    | (typeof ScheduleAvailabilitiesTable.$inferSelect)[]
    | undefined

  if (isMonday(date)) {
    availabilities = groupedAvailabilities.monday
  } else if (isTuesday(date)) {
    availabilities = groupedAvailabilities.tuesday
  } else if (isWednesday(date)) {
    availabilities = groupedAvailabilities.wednesday
  } else if (isThursday(date)) {
    availabilities = groupedAvailabilities.thursday
  } else if (isFriday(date)) {
    availabilities = groupedAvailabilities.friday
  } else if (isSaturday(date)) {
    availabilities = groupedAvailabilities.saturday
  } else if (isSunday(date)) {
    availabilities = groupedAvailabilities.sunday
  }

  if (availabilities == null) return []

  return availabilities.map(({ startTime, endTime }) => {
    const start = fromZonedTime(
      setMinutes(
        setHours(date, parseInt(startTime.split(":")[0])),
        parseInt(startTime.split(":")[1])
      ),
      timezone
    )

    const end = fromZonedTime(
      setMinutes(
        setHours(date, parseInt(endTime.split(":")[0])),
        parseInt(endTime.split(":")[1])
      ),
      timezone
    )

    return { start, end }
  })
}
