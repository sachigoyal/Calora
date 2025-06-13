import EventForm from "@/components/forms/EventForm";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export default async function EditEventPage({
  params: { eventId },
}: {
  params: { eventId: string };
}) {
  const { userId, redirectToSignIn } = await auth();
  if (userId == null) return redirectToSignIn();
  const event = await db.query.EventTable.findFirst({
    where: ({ id, clerkUserId }, { and, eq }) =>
      and(eq(clerkUserId, userId), eq(id, eventId)),
  })

  if (event == null) return notFound()
  return (
    <div className="w-full max-w-xl mx-auto my-8">
      <Card>
        <CardContent>
          <EventForm event={{...event, description: event.description || undefined}} />
        </CardContent>
      </Card>
    </div>
  );
}
