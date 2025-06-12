import { CalendarHeart } from "lucide-react";
import { AnimatedShinyText } from "./magicui/animated-shiny-text";
import NavLink from "./NavLink";
import { UserButton } from "@clerk/nextjs";
import ModeToggle from "./ModeToggle";

export default function Navbar() {
  return (
    <div className="flex items-center justify-between w-full max-w-7xl mt-4 mx-auto py-2 px-4 border rounded-2xl">
      <div>
        <AnimatedShinyText className="flex font-semibold items-center font-heading tracking-tight gap-1">
          <CalendarHeart size={22} />
          <span className="text-2xl">Calora</span>
        </AnimatedShinyText>
      </div>
      <div className="flex items-center gap-9 text-lg font-semibold">
        <NavLink href="/events">Events</NavLink>
        <NavLink href="/schedule">Schedule</NavLink>
      </div>

      <div className="flex items-center gap-5 sm:gap-3">
        <UserButton
          appearance={{ elements: { userButtonAvatarBox: "size-full" } }}
        />
        <ModeToggle className="border-none rounded-3xl bg-none" size={"sm"} />
      </div>
    </div>
  );
}
