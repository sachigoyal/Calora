import { Button } from "@/components/ui/button";
import { UserButton, UserProfile } from "@clerk/nextjs";


export default function EventsPage() {
    return (
        <>
            <h1> Events page</h1>
            <Button asChild>

          <UserButton/>
            </Button>
        </>
    );
}