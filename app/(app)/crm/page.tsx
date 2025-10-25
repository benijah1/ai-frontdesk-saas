// app/(app)/crm/page.tsx
'use client';

import { useMemo, useState } from 'react';

type Contact = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'New' | 'Working' | 'Qualified' | 'Customer' | 'Lost';
  lastActivity?: string; // ISO date
};

const SAMPLE: Contact[] = [
  { id: 'c1', name: 'Alex Ramos', email: 'alex@example.com', phone: '(415) 555-0101', status: 'New', lastActivity: '2025-10-21' },
  { id: 'c2', name: 'Taylor Kim', email: 'taylor@acme.co', status: 'Working', lastActivity: '2025-10-22' },
  { id: 'c3', name: 'Jordan Lee', email: 'jordan@remodelr.com', phone: '(206) 555-0147', status: 'Qualified', lastActivity: '2025-10-23' },
  { id: 'c4', name: 'Casey Wu', email: 'casey@fixit.com', status: 'Customer', lastActivity: '2025-10-20' },
  { id: 'c5', name: 'Sam Patel', email: 'sam@builder.io', status: 'Lost', lastActivity: '2025-10-18' },
];

const STATUS_OPTIONS: Contact['status'][] = ['New', 'Working', 'Qualified', 'Customer', 'Lost'];

export default function CrmPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'' | Contact['status']>('');
  const [sortBy, setSortBy] = useState<'name' | 'lastActivity' | 'status'>('lastActivity');

  const data = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let rows = SAMPLE.filter(r =>
      (!needle ||
        r.name.toLowerCase().includes(needle) ||
        r.email.toLowerCase().includes(needle) ||
        r.phone?.toLowerCase().includes(needle)) &&
      (!status || r.status === status)
    );

    rows = rows.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      // lastActivity default: newest first; undefined goes last
      const ad = a.lastActivity ? Date.parse(a.lastActivity) : 0;
      const bd = b.lastActivity ? Date.parse(b.lastActivity) : 0;
      return bd - ad;
    });

    return rows;
  }, [q, status, sortBy]);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">CRM</h1>
          <p className="text-slate-500 mt-1">Manage contacts, pipeline, and follow-ups.</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border px-3 py-2 hover:bg-slate-50">Import CSV</button>
          <button className="rounded-lg bg-slate-900 text-white px-3 py-2 hover:opacity-90">Add Contact</button>
        </div>
      </header>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4">
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Name, email, or phone"
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="rounded-lg border px-3 py-2 min-w-[160px]"
            >
              <option value="">All</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sort by</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="rounded-lg border px-3 py-2 min-w-[160px]"
            >
              <option value="lastActivity">Last activity</option>
              <option value="name">Name</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contacts table */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left font-semibold px-4 py-3">Name</th>
                <th className="text-left font-semibold px-4 py-3">Email</th>
                <th className="text-left font-semibold px-4 py-3">Phone</th>
                <th className="text-left font-semibold px-4 py-3">Status</th>
                <th className="text-left font-semibold px-4 py-3">Last Activity</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3">{row.email}</td>
                  <td className="px-4 py-3">{row.phone ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{row.lastActivity ?? '—'}</td>
                  <td className="px-4 py-3">
                    <button className="rounded-md border px-2 py-1 hover:bg-slate-50">Open</button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                    No contacts match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kanban + Settings stubs for future tabs */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <div className="font-semibold mb-2">Pipeline</div>
          <p className="text-slate-500 text-sm">Add stages and track opportunities (coming soon).</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="font-semibold mb-2">Automation</div>
          <p className="text-slate-500 text-sm">Trigger follow-ups and handoffs (coming soon).</p>
        </div>
      </div>
    </div>
  );
}
