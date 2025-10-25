import '../globals.css';
import Link from 'next/link';
import { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const nav = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/setup', label: 'Front Desk Setup' },
    { href: '/crm', label: 'CRM' },
    { href: '/calls', label: 'Calls' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen">
          <aside className="w-64 shrink-0 border-r bg-white">
            <div className="p-4 border-b">
              <div className="text-lg font-bold">AI Front Desk</div>
              <div className="text-xs text-slate-500">Tenant: {(session.user as any)?.tenantId ?? '—'}</div>
            </div>
            <nav className="p-2 space-y-1">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="block px-3 py-2 rounded-lg hover:bg-slate-100">
                  {n.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="flex-1">
            <header className="h-14 border-b bg-white flex items-center justify-between px-4">
              <div className="font-semibold">Welcome, {session.user?.name ?? 'User'}</div>
              <form action="/api/auth/signout" method="post">
                <button className="px-3 py-1.5 rounded-md border hover:bg-slate-50">Sign out</button>
              </form>
            </header>
            <section className="p-6">{children}</section>
          </main>
        </div>
      </body>
    </html>
  );
}
