// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Bot } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Front Desk",
  description: "Your 24/7 AI front desk for contractors",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#0A0B10] text-white antialiased overflow-x-hidden">
        <SiteHeader />
        <main>{children}</main>
        {/* <SiteFooter /> */}
      </body>
    </html>
  );
}

/** Inline header so there’s no missing import */
function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-slate-950/70">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            <span className="font-semibold tracking-tight">AI Front Desk</span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="/#features" className="hover:text-white/90">Features</a>
            <a href="/#how" className="hover:text-white/90">How it works</a>
            <a href="/#pricing" className="hover:text-white/90">Pricing</a>
            <a href="/#faq" className="hover:text-white/90">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="/login" className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5">Sign in</a>
            <a href="/#get-demo" className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400">
              Get a Demo
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

/** Optional footer, keep commented until you want it visible
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
