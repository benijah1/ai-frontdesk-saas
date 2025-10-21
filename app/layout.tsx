import type { Metadata } from "next"
import "./globals.css"
import Navbar from "@/components/Navbar" // <-- Navbar is default-exported from components/Navbar.tsx

export const metadata: Metadata = {
  title: "AI Front Desk",
  description: "Spin up your AI front desk in minutes.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="container">{children}</main>
      </body>
    </html>
  )
}
