"use client";
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
import { Clock, Trash2 } from "lucide-react";
import { CopyEventButton } from "./CopyEventButton";
import { Button } from "./ui/button";
import Link from "next/link";
import { Edit } from "lucide-react";
import { Badge } from "./ui/badge";
import { useTransition, useState } from "react";
import { z } from "zod";
import { eventFormSchema } from "@/schema/events";
import { deleteEvent } from "@/server/actions/event";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
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
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const data = await deleteEvent(id);

      if (data?.error) {
        setDeleteError("There was an error deleting your event");
      } else {
        setDeleteError(null);
      }
    });
  };

  return (
    <div>
      <Card
        className={cn(
          "flex flex-col hover:shadow-md hover:cursor-pointer bg-muted/50 h-full",
          !isActive && "border-secondary/50"
        )}
      >
        <CardHeader
          className={cn("relative mb-1", !isActive && "opacity-50")}
        >
          <CardTitle className="text-xl">{name}</CardTitle>
          <CardDescription>
            <Badge variant="secondary" className="text-xs font-medium">
              <Clock className="size-4" />
              {formatEventTime(durationInMinutes)}
            </Badge>
          </CardDescription>
          <div className="flex items-center justify-end gap-2 absolute bottom-7 right-4">
            {isActive && (
              <CopyEventButton
                variant="ghost"
                size="icon"
                className="cursor-pointer h-8 w-8 text-muted-foreground hover:text-foreground"
                eventId={id}
                clerkUserId={clerkUserId}
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer h-8 w-8 text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link href={`/events/${id}/edit`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        {description != null && (
          <CardContent className={cn("flex flex-1 pb-10 pr-4",!isActive && "opacity-50")}>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </CardContent>
        )}
        <CardFooter className="relative">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeletePending}  className="cursor-pointer absolute bottom-4 right-4">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this event "{name}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer" disabled={isDeletePending}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={isDeletePending}
                  onClick={handleDelete}
                  className="bg-destructive cursor-pointer hover:bg-red-500/85 text-white"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeletePending ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
