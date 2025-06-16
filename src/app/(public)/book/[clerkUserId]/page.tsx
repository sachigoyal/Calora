import { Badge } from "@/components/ui/badge";
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
import { formatEventTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { clerkClient } from "@clerk/nextjs/server";
import { Clock, MoveRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function BookingPage({
  params: { clerkUserId },
}: {
  params: { clerkUserId: string };
}) {
  const events = await db.query.EventTable.findMany({
    where: ({ clerkUserId: userIdCol, isActive }, { eq, and }) =>
      and(eq(userIdCol, clerkUserId), eq(isActive, true)),
    orderBy: ({ name }, { asc, sql }) => asc(sql`lower(${name})`),
  });

  if (events.length === 0) return notFound();

  const client = await clerkClient();
  const { fullName } = await client.users.getUser(clerkUserId);

  return (
    <div>
      <div className="mx-auto max-w-4xl my-7">
        <div className="text-3xl md:text-4xl font-bold text-center">
          {fullName}
        </div>
        <div className="text-lg text-muted-foreground text-center my-2">
          Welcome to my scheduling page. Please follow the instructions to add
          an event to my calendar.
        </div>
      </div>
      <div>
        <div className="w-full max-w-7xl mx-auto my-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 auto-cols-fr">
            {events.map(event => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type EventCardProps = {
  id: string;
  name: string;
  description: string | null;
  durationInMinutes: number;
  clerkUserId: string;
};

export function EventCard({
  id,
  name,
  description,
  durationInMinutes,
  clerkUserId,
}: EventCardProps) {
  return (
    <div>
      <Card
        className={cn(
          "flex flex-col hover:shadow-md hover:cursor-pointer bg-muted/50 h-full",
        )}
      >
        <CardHeader className={cn("relative mb-1", "flex flex-row justify-between")}>
          <CardTitle className="text-2xl">{name}</CardTitle>
          <CardDescription>
            <Badge variant="secondary" className="text-xs font-medium">
              <Clock className="size-4" />
              {formatEventTime(durationInMinutes)}
            </Badge>
          </CardDescription>
        </CardHeader>
        {description != null && (
          <CardContent className={cn("flex flex-1 pb-1 pr-4")}>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </CardContent>
        )}
        <CardFooter className="relative">
          <Button asChild className="w-full">
            <Link href={`/book/${clerkUserId}/${id}`}>
              Book Now
              <MoveRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
