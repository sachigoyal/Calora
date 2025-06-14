import Navbar from "@/components/Navbar";
import { ReactNode } from "react";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
