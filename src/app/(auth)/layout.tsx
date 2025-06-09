import { ReactNode } from "react";


export default function AuthLayout({children}: {children: ReactNode}) {
   return (
    <div className="min-h-screen flex flex-col items-center justify-center">
        {children}
    </div>
   )
}