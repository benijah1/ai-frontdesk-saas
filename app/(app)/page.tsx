// app/(app)/page.tsx
import { redirect } from "next/navigation";

export default function AppIndexRedirect() {
  // Redirect root of the app group to /dashboard
  redirect("/dashboard");
}
