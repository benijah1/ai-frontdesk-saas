// app/(app)/page.tsx
import { redirect } from 'next/navigation';

// Ensure this is never statically generated.
// This avoids the ENOENT for "(app)/page_client-reference-manifest.js".
export const dynamic = 'force-dynamic';

export default function AppIndexRedirect() {
  redirect('/dashboard');
}
