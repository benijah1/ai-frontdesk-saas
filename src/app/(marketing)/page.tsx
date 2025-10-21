import Link from "next/link"

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-bold">AI Front Desk for Service Businesses</h1>
      <p className="mt-4 text-lg text-gray-600">
        Spin up a branded AI Front Desk, answer leads 24/7, and never miss a job again.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/signup" className="rounded-xl px-4 py-2 border">
          Get Started — $25/mo
        </Link>
        <Link href="/signin" className="rounded-xl px-4 py-2 border">
          Sign in
        </Link>
      </div>
    </main>
  )
}
