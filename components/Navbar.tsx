"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  return (
    <header className="border-b">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="font-semibold text-lg">AI FrontDesk</Link>
        <nav className="flex items-center gap-4">
          <Link className={`link ${pathname === "/" ? "font-semibold" : ""}`} href="/">Home</Link>
          <Link className={`link ${pathname?.startsWith("/dashboard") ? "font-semibold" : ""}`} href="/dashboard">Dashboard</Link>
          <Link className={`link ${pathname === "/sign-in" ? "font-semibold" : ""}`} href="/sign-in">Sign in</Link>
          <Link className={`btn`} href="/sign-up">Get Started</Link>
        </nav>
      </div>
    </header>
  );
}
