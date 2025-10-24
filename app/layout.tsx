// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Front Desk",
  description: "Modern AI receptionist for contractors",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SiteHeader />
        <main className="min-h-[calc(100dvh-4rem)]">{children}</main>
        {/* To enable the footer later, uncomment the component below and the footer function. */}
        {/* <SiteFooter /> */}
      </body>
    </html>
  );
}

/** -------------------- Header -------------------- */
function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0b0f17]/80 backdrop-blur supports-[backdrop-filter]:bg-[#0b0f17]/60">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between gap-4 px-4">
        {/* Brand */}
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight text-white"
          aria-label="AI Front Desk Home"
        >
          <span className="inline-block h-6 w-6 rounded-md bg-gradient-to-br from-indigo-400 to-cyan-400 opacity-90 transition group-hover:opacity-100" />
          <span>AI&nbsp;Front&nbsp;Desk</span>
        </Link>

        {/* Nav */}
        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          <NavLink href="/#features">Features</NavLink>
          <NavLink href="/#pricing">Pricing</NavLink>
          <NavLink href="/docs">Docs</NavLink>
          <Link
            href="/login"
            className="ml-2 inline-flex h-9 items-center rounded-md border border-white/15 px-3 text-sm font-medium text-white/90 transition hover:border-white/25 hover:text-white"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center rounded-md px-2 text-sm text-white/80 transition hover:text-white"
    >
      {children}
    </Link>
  );
}

/*
-------------------- Optional Footer (keep commented until needed) --------------------

import { Bot } from "lucide-react";

function SiteFooter() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-screen-xl px-4 py-10 text-sm text-white/70">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <span>AI Front Desk</span>
            <span className="mx-2 opacity-50">•</span>
            <span>Made for contractors</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/#pricing" className="hover:text-white">Pricing</a>
            <a href="/#features" className="hover:text-white">Features</a>
            <a href="/login" className="hover:text-white">Sign in</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
*/
