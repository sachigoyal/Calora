import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Navbar from "@/components/Navbar";

export default async function Home() {
  const { userId } = await auth();
  if (userId != null) redirect("/events");
  return (
  
    <div className="text-center container mx-auto my-4">
        <Navbar/>
      <div className="text-3xl mb-4">Home Page</div>
      <div className="gap-2 flex justify-center">

        <Button asChild>
          <SignInButton />
        </Button>
        <Button asChild>
          <SignUpButton />
        </Button>
        <UserButton />
      </div>
    </div>
  );
}
