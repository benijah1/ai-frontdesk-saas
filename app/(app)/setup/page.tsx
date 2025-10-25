import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import FrontDeskSetupForm from "@/components/FrontDeskSetupForm";
import { redirect } from "next/navigation";

export default async function SetupPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const tenant = await prisma.tenant.findFirst({
    where: { users: { some: { id: userId } } },
    include: { services: true },
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-1">Front Desk Setup</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Provide your business details and services. We’ll use these to theme the AI Front Desk, generate the
        opening animation content, and build your service cards.
      </p>

      <FrontDeskSetupForm initialData={tenant ?? undefined} />
    </main>
  );
}
