// app/layout.tsx
import "./globals.css"
import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header" // or whatever your header is named
import { SiteFooter } from "@/components/site-footer" // optional

export const metadata: Metadata = {
  title: "AI Front Desk",
  description: "Your 24/7 AI front desk for contractors",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#0A0B10] text-white antialiased overflow-x-hidden">
        <SiteHeader />
        <main>{children}</main>
        {/* <SiteFooter /> */}
      </body>
    </html>
  )
}
