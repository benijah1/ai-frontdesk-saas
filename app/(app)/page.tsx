// app/(app)/page.tsx
import { redirect } from 'next/navigation';

// Force dynamic render & disable Edge so Next won't try to prerender or trace client manifest.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function AppIndexRedirect() {
  redirect('/dashboard');
}
