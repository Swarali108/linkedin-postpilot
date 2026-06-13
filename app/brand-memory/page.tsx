import Link from "next/link";
import BrandMemory from "@/components/profile/BrandMemory";

export default function BrandMemoryPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <Link href="/" className="text-sm text-linkedin hover:underline">
          ← PostPilot
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Brand Memory</h1>
        <p className="text-gray-600">
          Your writing, remembered. Posts are embedded locally with
          all-MiniLM-L6-v2 and retrieved semantically when you generate.
        </p>
      </header>
      <BrandMemory />
    </main>
  );
}
