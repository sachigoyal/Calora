import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
  <div className="text-center container mx-auto my-4">
    <div className="text-3xl mb-4">Home Page</div>
    <div className="gap-2 flex justify-center">
      <Button>Sign In</Button>
      <Button>Sign Up</Button>

      <Button asChild>
       <SignInButton/>
      </Button>
      <Button asChild>
        <SignUpButton/>
      </Button>
      <UserButton/>
    </div>

  </div>
  );
}
