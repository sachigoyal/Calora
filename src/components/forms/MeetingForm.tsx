"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import Link from "next/link";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { meetFormSchema } from "@/schema/meetings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  formatDate,
  formatTimeString,
  formatTimezoneOffset,
} from "@/lib/formatters";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ArrowRight, CalendarIcon, Clock, Globe, Mail, MessageSquare, User } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { toZonedTime } from "date-fns-tz";
import { createMeeting } from "@/server/actions/meetings";

export function MeetingForm({
  validTimes,
  eventId,
  clerkUserId,
}: {
  validTimes: Date[];
  eventId: string;
  clerkUserId: string;
}) {
  const form = useForm<z.infer<typeof meetFormSchema>>({
    resolver: zodResolver(meetFormSchema),
    defaultValues: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const timezone = form.watch("timezone");
  const date = form.watch("date");
  const validTimesInTimezone = useMemo(() => {
    return validTimes.map(date => toZonedTime(date, timezone));
  }, [validTimes, timezone]);

  async function onSubmit(values: z.infer<typeof meetFormSchema>) {
    const data = await createMeeting({
      ...values,
      eventId,
      clerkUserId,
    });

    if (data?.error) {
      form.setError("root", {
        message: "There was an error saving your event",
      });
    }
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold">Schedule a Meeting</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Select your preferred date and time, and we'll send you a
          confirmation.
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
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Timezone
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Intl.supportedValuesOf("timeZone").map(timezone => (
                      <SelectItem key={timezone} value={timezone}>
                        {timezone}
                        {` (${formatTimezoneOffset(timezone)})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <Popover>
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Date
                    </FormLabel>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            formatDate(field.value)
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={date =>
                          !validTimesInTimezone.some(time =>
                            isSameDay(date, time)
                          )
                        }
                        initialFocus
                      />
                    </PopoverContent>
                    <FormMessage />
                  </FormItem>
                </Popover>
              )}
            />
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time
                  </FormLabel>
                  <Select
                    disabled={date == null || timezone == null}
                    onValueChange={value =>
                      field.onChange(new Date(Date.parse(value)))
                    }
                    defaultValue={field.value?.toISOString()}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            date == null || timezone == null
                              ? "Select a date/timezone first"
                              : "Select a meeting time"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {validTimesInTimezone
                        .filter(time => isSameDay(time, date))
                        .map(time => (
                          <SelectItem
                            key={time.toISOString()}
                            value={time.toISOString()}
                          >
                            {formatTimeString(time)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="guestName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Your Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="guestEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Your Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="guestNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Notes</FormLabel>
                <FormControl>
                  <Textarea className="resize-none h-24" placeholder="Any additional information or questions?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2 justify-end">
            <Button
              disabled={form.formState.isSubmitting}
              type="button"
              asChild
              variant="outline"
            >
              <Link href={`/book/${clerkUserId}`}>Cancel</Link>
            </Button>
            <Button disabled={form.formState.isSubmitting} type="submit">
                {form.formState.isSubmitting ? "Scheduling..." : "Schedule"}
                <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
