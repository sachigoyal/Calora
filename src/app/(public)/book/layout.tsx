import Navbar from "@/components/Navbar"
import { ReactNode } from "react"

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <main>{children}</main>
    </>
  )
}