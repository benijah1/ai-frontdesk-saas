"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";


export default function Navbar() {
const pathname = usePathname();
const [open, setOpen] = useState(false);


// Close on route change
useEffect(() => { setOpen(false); }, [pathname]);


const isActive = (href: string) =>
pathname === href || pathname?.startsWith(href + "/");


return (
  <header className="sticky top-0 z-40 w-full border-b border-[color:var(--border)] bg-[color:var(--card)]/80 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--card)]/60">
    <nav className="container-page flex h-14 items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden btn btn-ghost p-2"
          aria-label="Toggle Menu"
          onClick={() => setOpen((s) => !s)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
        <Link href="/" className="font-semibold tracking-tight">
          AI Front Desk
        </Link>
      </div>


      <ul className="hidden md:flex items-center gap-6">
        <li>
        <Link className={`nav-link ${isActive("/") ? "nav-link-active" : ""}`} href="/">Home</Link>
        </li>
        <li>
        <Link className={`nav-link ${isActive("/dashboard") ? "nav-link-active" : ""}`} href="/dashboard">Dashboard</Link>
        </li>
        <li>
        <Link className={`nav-link ${isActive("/crm") ? "nav-link-active" : ""}`} href="/crm">CRM</Link>
        </li>
        <li>
        <Link className={`nav-link ${isActive("/services") ? "nav-link-active" : ""}`} href="/services">Services</Link>
        </li>
      </ul>


      <div className="hidden md:flex items-center gap-2">
          <Link href="/auth/signin" className="btn btn-ghost">Sign in</Link>
          <Link href="/auth/signup" className="btn btn-primary">Start Free</Link>
        </div>
      </nav>


      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-[color:var(--border)] bg-[color:var(--card)]">
          <div className="container-page flex flex-col py-3">
            <Link className={`py-2 nav-link ${isActive("/") ? "nav-link-active" : ""}`} href="/">Home</Link>
            <Link className={`py-2 nav-link ${isActive("/dashboard") ? "nav-link-active" : ""}`} href="/dashboard">Dashboard</Link>
            <Link className={`py-2 nav-link ${isActive("/crm") ? "nav-link-active" : ""}`} href="/crm">CRM</Link>
            <Link className={`py-2 nav-link ${isActive("/services") ? "nav-link-active" : ""}`} href="/services">Services</Link>
            <div className="mt-2 flex gap-2">
              <Link href="/auth/signin" className="btn btn-ghost">Sign in</Link>
              <Link href="/auth/signup" className="btn btn-primary">Start Free</Link>
            </div>
          </div>
        </div>
      )}
      </header>
    );
  }
