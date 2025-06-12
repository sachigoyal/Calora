import EventForm from "@/components/forms/EventForm";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function NewEventPage() {
  return (
    <div className="w-full max-w-xl mx-auto my-8">
      <Card>
        <CardContent>
          <EventForm />
        </CardContent>
      </Card>
    </div>
  );
}
