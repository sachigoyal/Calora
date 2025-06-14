import ScheduleForm from "@/components/forms/ScheduleForm";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/drizzle/db";

export default async function NewEventPage() {
  const { userId, redirectToSignIn } = await auth();
  if (userId == null) return redirectToSignIn();

  const schedule = await db.query.ScheduleTable.findFirst({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
    with: { availabilities: true },
  });
  return (
    <div className="w-full max-w-xl mx-auto my-8">
      <Card>
        <CardContent>
          <ScheduleForm schedule={schedule} />
        </CardContent>
      </Card>
    </div>
  );
}
