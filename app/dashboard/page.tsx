import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions as any);
  if (!session) redirect("/sign-in?callbackUrl=/dashboard");

  return (
    <div className="space-y-6 mt-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="font-semibold mb-2">Tenant Theming</h3>
          <p className="text-gray-600">Set your colors, logo, and subdomain.</p>
          <Link className="link" href="#">Open settings</Link>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-2">AI Front Desk</h3>
          <p className="text-gray-600">Try chat/voice with your business profile.</p>
          <Link className="link" href="#">Open front desk</Link>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-2">Billing</h3>
          <p className="text-gray-600">Stripe paywall is disabled for now.</p>
          <Link className="link" href="#">Manage billing</Link>
        </div>
      </div>
    </div>
  );
}
