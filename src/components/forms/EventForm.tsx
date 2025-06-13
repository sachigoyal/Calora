"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { eventFormSchema, EventFormSchema } from "@/schema/events";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { createEvent, updateEvent } from "@/server/actions/event";
import Link from "next/link";
import { Calendar, Clock, FileText } from "lucide-react";

export default function EventForm({
  event,
}: {
  event?: {
    id: string;
    name: string;
    description?: string;
    durationInMinutes: number;
    isActive: boolean;
  };
}) {
  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: event ?? {
      isActive: true,
      durationInMinutes: 30,
    },
  });

  const onSubmit = async (values: z.infer<typeof eventFormSchema>) => {
    console.log(values);
    const action =
      event == null ? createEvent : updateEvent.bind(null, event.id);
    const data = await action(values);
    if (data?.error) {
      form.setError("root", {
        message: "There was an error saving your event",
      });
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          {event ? "Edit Event" : "Create Event"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {event ? "Update your event details" : "Fill in the details below"}
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {form.formState.errors.root && (
            <div className="text-destructive text-sm">
              {form.formState.errors.root.message}
            </div>
          )}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Event Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter event name" {...field} />
                </FormControl>
                <FormDescription>The Event name user will see</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="durationInMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Duration
                </FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>In Minutes</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your event..."
                    className="resize-none h-24"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional description of the event
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border px-4 py-3">
                <div className="space-y-2">
                  <FormLabel>Active Status</FormLabel>
                  <FormDescription className="text-sm">
                    Inactive events won't be visible for booking
                  </FormDescription>
                </div>
                <div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              asChild
            >
              <Link href="/events">Cancel</Link>
            </Button>
            <Button type="submit" className="cursor-pointer">
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
