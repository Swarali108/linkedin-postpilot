import Link from "next/link";
import TopicDiscovery from "@/components/topics/TopicDiscovery";

export default function TopicDiscoveryPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <Link href="/" className="text-sm text-linkedin hover:underline">
          ← PostPilot
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Topic Discovery
        </h1>
        <p className="text-gray-600">
          Stuck on what to post? Get personalized, non-generic topic ideas.
        </p>
      </header>
      <TopicDiscovery />
    </main>
  );
}
