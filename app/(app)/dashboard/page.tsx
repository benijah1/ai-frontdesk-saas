import prisma from "@/lib/prisma";
import FrontDeskSetupForm from "@/components/FrontDeskSetupForm";
import { auth } from "@/auth"; // or your getServerSession helper

export default async function DashboardPage() {
  const session = await auth(); // adjust to your NextAuth helper
  const userId = session?.user?.id;

  let tenant: any = null;
  if (userId) {
    tenant = await prisma.tenant.findFirst({
      where: { users: { some: { id: userId } } },
      include: { services: true },
    });
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-semibold">Welcome</h1>

      {/* Setup card */}
      <div className="mb-8">
        <FrontDeskSetupForm initialData={tenant ?? undefined} />
      </div>

      {/* Existing dashboard sections */}
      {/* ... */}
    </main>
  );
}
