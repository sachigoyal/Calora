import { formatEventTime } from "@/lib/formatters";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { CopyEventButton } from "./CopyEventButton";
import { Button } from "./ui/button";
import Link from "next/link";
import { Edit } from "lucide-react";
type EventCardProps = {
  id: string;
  name: string;
  description: string | null;
  durationInMinutes: number;
  isActive: boolean;
  clerkUserId: string;
};

export function EventCard({
  id,
  name,
  description,
  durationInMinutes,
  isActive,
  clerkUserId,
}: EventCardProps) {
  return (
    <div>
      <Card className={cn("flex flex-col", !isActive && "border-secondary/50")}>
        <CardHeader className={cn("relative", !isActive && "opacity-50")}>
          <CardTitle>{name}</CardTitle>
          <CardDescription>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="size-4" />
              {formatEventTime(durationInMinutes)}
            </div>
          </CardDescription>
          <div className="flex items-center justify-end gap-3 absolute bottom-5 right-4">
            {isActive && <CopyEventButton />}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" asChild>
              <Link href={`/events/${id}/edit`}> <Edit className="h-4 w-4" /></Link>
            </Button>
          </div>
        </CardHeader>
        {description != null && (
          <CardContent className={cn(!isActive && "opacity-50")}>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
