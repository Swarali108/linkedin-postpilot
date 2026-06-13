import Link from "next/link";
import Dashboard from "@/components/dashboard/Dashboard";

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link href="/" className="text-sm text-linkedin hover:underline">
        ← Home
      </Link>
      <div className="mt-4">
        <Dashboard />
      </div>
    </main>
  );
}
