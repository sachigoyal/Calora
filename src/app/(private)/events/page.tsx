
import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import { auth } from "@clerk/nextjs/server";
import { CalendarPlus, CalendarRange } from "lucide-react";
import Link from "next/link";
import { EventCard } from "@/components/EventCard";

export default async function EventsPage() {
  const { userId, redirectToSignIn } = await auth();

  if (userId == null) return redirectToSignIn();

  const events = await db.query.EventTable.findMany({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
    orderBy: ({ createdAt }, { desc }) => desc(createdAt),
  });

  return (
    <>
      <div className="w-full max-w-7xl mx-auto my-8">
        <div className="flex items-center justify-between">
          <span className="text-4xl font-semibold font-heading">Events</span>
          <Button asChild>
            <Link href="/events/new">
              <CalendarPlus className="size-5" />
              <span>New Event</span>
            </Link>
          </Button>
        </div>
        {events.length > 0 ? (
          <div className="w-full max-w-7xl mx-auto my-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              < EventCard key={event.id} {...event} />
            ))}
          </div>
          </div>
        ) : (
          <div className=" flex items-center justify-center h-[70vh]">
            <div className="flex gap-4 max-w-4xl items-center flex-col mx-auto">
              <CalendarRange size={50} className="text-muted-foreground" />
              <span className="text-2xl font-semibold text-muted-foreground">
                You do not have any events yet. Create your first event to get
                started!
              </span>
              <Button asChild size="lg" className="w-full">
                <Link href="/events/new">
                  <CalendarPlus className="size-6 mr-1" />
                  <span className="text-md">New Event</span>
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
