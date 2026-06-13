import { Suspense } from "react";
import Link from "next/link";
import PostGenerator from "@/components/posts/PostGenerator";

export default function PostGeneratorPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <Link href="/" className="text-sm text-linkedin hover:underline">
          ← PostPilot
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Post Generator</h1>
        <p className="text-gray-600">
          Enter a topic and get a complete, ready-to-post LinkedIn post.
        </p>
      </header>
      <Suspense fallback={<div className="text-gray-400">Loading…</div>}>
        <PostGenerator />
      </Suspense>
    </main>
  );
}
