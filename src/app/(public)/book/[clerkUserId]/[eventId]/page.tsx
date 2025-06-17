
import { MeetingForm } from "@/components/forms/MeetingForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { getValidateTimeFromSchedule } from "@/lib/getValidateTimeFromSchedule";
import { clerkClient } from "@clerk/nextjs/server";
import {
  addMonths,
  eachMinuteOfInterval,
  endOfDay,
  roundToNearestMinutes,
} from "date-fns";
import { ArrowLeft, ArrowRight, CalendarX } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function BookEventPage({
  params,
}: {
  params: Promise<{ clerkUserId: string; eventId: string }>;
}) {
  const { clerkUserId, eventId } = await params;
  const event = await db.query.EventTable.findFirst({
    where: ({ clerkUserId: userIdCol, isActive, id }, { eq, and }) =>
      and(eq(isActive, true), eq(userIdCol, clerkUserId), eq(id, eventId)),
  });

  if (event == null) return notFound();
  const calendarUser = await (await clerkClient()).users.getUser(clerkUserId);
  const startDate = roundToNearestMinutes(new Date(), {
    nearestTo: 15,
    roundingMethod: "ceil",
  });
  const endDate = endOfDay(addMonths(startDate, 2));

  const validTimes = await getValidateTimeFromSchedule(
    eachMinuteOfInterval({ start: startDate, end: endDate }, { step: 15 }),
    event
  );
  if (validTimes.length === 0) {
    return <NoTimeSlot event={event} calendarUser={calendarUser} />;
  }

  return (
  <div className="w-full min-h-screen max-w-2xl mx-auto flex justify-center items-center">
      <Card className="p-5">
        <MeetingForm
          validTimes={validTimes}
          eventId={event.id}
          clerkUserId={clerkUserId}
        />
      </Card>
    </div>
  );
}

function NoTimeSlot({
  event,
  calendarUser,
}: {
  event: { name: string; description: string | null };
  calendarUser: { id: string; fullName: string | null };
}) {
  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md relative">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <CalendarX className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl">No available slots</CardTitle>
            <CardDescription>
              <span className="font-medium text-black">{event.name}</span> with{" "}
              <span className="font-medium text-black">
                {calendarUser.fullName}
              </span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-3">
          {event?.description && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
              <p className="text-sm text-blue-800">{event.description}</p>
            </div>
          )}
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {calendarUser.fullName} is currently fully booked
            </p>
            <p className="text-sm text-muted-foreground">
              Please check back later or choose a different event type
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href={`/book/${calendarUser.id}`}>
              Choose Another Event
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
