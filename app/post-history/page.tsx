import Link from "next/link";
import PostHistory from "@/components/posts/PostHistory";

export default function PostHistoryPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8">
        <Link href="/dashboard" className="text-sm text-linkedin hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Post History</h1>
        <p className="text-gray-600">
          Every post you&apos;ve generated, with its reach score. Stored in your browser.
        </p>
      </header>
      <PostHistory />
    </main>
  );
}
