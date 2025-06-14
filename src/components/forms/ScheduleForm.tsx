"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { Globe, Calendar, Plus, X } from "lucide-react";
import { DAYS_OF_WEEK_IN_ORDER } from "@/data/constants";
import { scheduleFormSchema } from "@/schema/schedule";
import { timeToInt } from "@/lib/utils";
import { saveSchedule } from "@/server/actions/schedule";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select";
import { formatTimezoneOffset } from "@/lib/formatters";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

type Availability = {
  startTime: string;
  endTime: string;
  dayOfWeek: (typeof DAYS_OF_WEEK_IN_ORDER)[number];
};

export default function ScheduleForm({
  schedule,
}: {
  schedule?: {
    timezone: string;
    availabilities: Availability[];
  };
}) {
  const [successMessage, setSuccessMessage] = useState<string>();

  const form = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      timezone:
        schedule?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      availabilities: schedule?.availabilities.toSorted((a, b) => {
        return timeToInt(a.startTime) - timeToInt(b.endTime);
      }),
    },
  });

  const {
    append: addAvailability,
    remove: removeAvailability,
    fields: availabilityFields,
  } = useFieldArray({ name: "availabilities", control: form.control });

  const groupedAvailabilityFields = Object.groupBy(
    availabilityFields.map((field, index) => ({ ...field, index })),
    (availability) => availability.dayOfWeek
  );

  const onSubmit = async (values: z.infer<typeof scheduleFormSchema>) => {
    console.log("Form submitted with values:", values);
    console.log("Form errors:", form.formState.errors);
    console.log("Form is valid:", form.formState.isValid);

    const data = await saveSchedule(values);
    if (data?.error) {
      form.setError("root", {
        message: "There was an error saving your schedule",
      });
    } else {
      setSuccessMessage("Schedule saved!");
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Schedule</h1>
        <p className="text-muted-foreground text-sm">
          Set your availability for booking appointments
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} onInvalid={()=> {console.log("Invalid form submission")}} className="space-y-6">
          {form.formState.errors.root && (
            <div className="text-destructive text-xs">
              {form.formState.errors.root.message}
            </div>
          )}
          {successMessage && (
            <div className="text-green-500 text-xs">{successMessage}</div>
          )}
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  TimeZone
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full max-w-xl">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-100">
                    {Intl.supportedValuesOf("timeZone").map((timezone) => (
                      <SelectItem key={timezone} value={timezone}>
                        {timezone}
                        {`(${formatTimezoneOffset(timezone)})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              Weekly Availability
            </Label>
            <div className="space-y-4">
              {DAYS_OF_WEEK_IN_ORDER.map((dayOfWeek) => (
                <Fragment key={dayOfWeek}>
                  <div className="rounded-lg border px-4 py-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="capitalize font-semibold text-sm">
                        {dayOfWeek.substring(0, 3)}
                      </span>
                      <Button
                        type="button"
                        className="size-7"
                        variant="outline"
                        onClick={() => {
                          addAvailability({
                            dayOfWeek,
                            startTime: "09:00",
                            endTime: "17:00",
                          });
                        }}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {groupedAvailabilityFields[dayOfWeek]?.map(
                        (field, labelIndex) => (
                          <div key={field.id} className="space-y-2">
                            <div className="flex items-center gap-3 p-2 bg-muted rounded-md">
                              <FormField
                                control={form.control}
                                name={`availabilities.${field.index}.startTime`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        className="h-9 w-20"
                                        aria-label={`${dayOfWeek} Start Time ${
                                          labelIndex + 1
                                        }`}
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                  </FormItem>
                                )}
                              />
                              <span className="text-sm text-muted-foreground font-medium">
                                to
                              </span>
                              <FormField
                                control={form.control}
                                name={`availabilities.${field.index}.endTime`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        className="h-9 w-20"
                                        aria-label={`${dayOfWeek} End Time ${
                                          labelIndex + 1
                                        }`}
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                  </FormItem>
                                )}
                              />
                              <Button
                                className="size-7 cursor-pointer"
                                type="button"
                                variant="ghost"
                                onClick={() => removeAvailability(field.index)}
                              >
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </Fragment>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Click the + button to add availability for each day
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              asChild
            >
              <Link href="/">Cancel</Link>
            </Button>
            <Button
              type="submit"
              className="cursor-pointer"
            >
              {form.formState.isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
