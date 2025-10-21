import "./globals.css"
import Link from "next/link"
import { auth } from "@/lib/auth"

export const metadata = {
  title: "AI Front Desk",
  description: "Spin up a branded AI Front Desk for your business in minutes.",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        <header className="border-b">
          <nav className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-semibold">AI Front Desk</Link>
              <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</Link>
            </div>
            <div className="flex items-center gap-3">
              {session?.user ? (
                <>
                  <Link href="/dashboard" className="text-sm">Dashboard</Link>
                </>
              ) : (
                <>
                  <Link href="/signin" className="text-sm">Sign in</Link>
                  <Link href="/signup" className="text-sm rounded bg-black text-white px-3 py-1.5">Get Started</Link>
                </>
              )}
            </div>
          </nav>
        </header>
        {children}
        <footer className="mt-16 border-t">
          <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-gray-500">
            © {new Date().getFullYear()} AI Front Desk. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  )
}
