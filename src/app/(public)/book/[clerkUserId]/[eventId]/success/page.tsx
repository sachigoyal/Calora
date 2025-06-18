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
import { formatDateTime } from "@/lib/formatters";
import { clerkClient } from "@clerk/nextjs/server";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ clerkUserId: string; eventId: string }>;
  searchParams: Promise<{ startTime: string }>;
}) {
  const { clerkUserId, eventId } = await params;
  const { startTime } = await searchParams;
  const event = await db.query.EventTable.findFirst({
    where: ({ clerkUserId: userIdCol, isActive, id }, { eq, and }) =>
      and(eq(isActive, true), eq(userIdCol, clerkUserId), eq(id, eventId)),
  });

  if (event == null) return notFound();
  const calendarUser = await (await clerkClient()).users.getUser(clerkUserId);
  const startTimeDate = new Date(startTime);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-lg mx-auto w-full">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-xl font-semibold">
            Successfully Booked!
          </CardTitle>
          <CardDescription className="text-md">
            <span className="font-medium text-black">{event.name}</span> with{" "}
            <span className="font-medium text-black">
              {calendarUser.fullName}
            </span>
          </CardDescription>
          <div className="px-4 py-2 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">
              At {formatDateTime(startTimeDate)}
            </p>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              You should receive an email confirmation shortly with all the
              meeting details.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            You can safely close this page now.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href={`/book/${clerkUserId}`}>Go back
            <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild className="w-full" variant="outline">
            <Link href="/events">Go to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
