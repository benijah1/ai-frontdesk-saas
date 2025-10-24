// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
// If you decide to enable the footer later, uncomment the next line too.
// import { Bot } from "lucide-react";

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
        {children}
        {/* To enable the footer, also uncomment <SiteFooter /> and the Bot import. */}
        {/* <SiteFooter /> */}
      </body>
    </html>
  );
}

/*
  Optional footer — keep this whole block commented out until you want it visible.

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
