import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Fix It! Home Services - Professional Bathroom, Plumbing & HVAC",
  description:
    "Licensed contractor specializing in bathroom remodeling, plumbing, and HVAC services. License #948319. Call 951-525-1848 for expert home services.",
  generator: "v0.app",
}

const geistSans = GeistSans.variable
const geistMono = GeistMono.variable

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans} ${geistMono} antialiased`}>
      <head>
        <link
          rel="icon"
          href="https://static.wixstatic.com/media/fe91c7_7eb6d04a978a42539e47b0c35541b5d8~mv2.jpg/v1/fill/w_148,h_150,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/WhatsApp%20Image%202025-05-22%20at%2012_edited.jpg"
        />
        <meta
          property="og:image"
          content="https://static.wixstatic.com/media/fe91c7_7eb6d04a978a42539e47b0c35541b5d8~mv2.jpg/v1/fill/w_148,h_150,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/WhatsApp%20Image%202025-05-22%20at%2012_edited.jpg"
        />
        <meta
          name="twitter:image"
          content="https://static.wixstatic.com/media/fe91c7_7eb6d04a978a42539e47b0c35541b5d8~mv2.jpg/v1/fill/w_148,h_150,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/WhatsApp%20Image%202025-05-22%20at%2012_edited.jpg"
        />
        <meta property="og:title" content="Fix It! Home Services - Professional Bathroom, Plumbing & HVAC" />
        <meta
          property="og:description"
          content="Licensed contractor specializing in bathroom remodeling, plumbing, and HVAC services. License #948319. Call 951-525-1848 for expert home services."
        />
      </head>
      <body>
        <Suspense fallback={null}>
          {children}
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
