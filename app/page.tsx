import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 rounded-full bg-linkedin/10 px-4 py-1 text-sm font-medium text-linkedin">
        Your Personal LinkedIn Operating System
      </span>
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
        Write LinkedIn posts that <span className="text-linkedin">stop the scroll</span>
      </h1>
      <p className="mt-5 max-w-xl text-lg text-gray-600">
        Give PostPilot a topic. Get scroll-stopping hooks, a complete post in your
        chosen tone, reach-tiered hashtags, and a matching visual prompt — in
        under a minute.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/dashboard"
          className="rounded-lg bg-linkedin px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-linkedin-dark"
        >
          Open dashboard →
        </Link>
        <Link
          href="/post-generator"
          className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition hover:border-linkedin hover:text-linkedin"
        >
          Generate a post
        </Link>
        <Link
          href="/topic-discovery"
          className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition hover:border-linkedin hover:text-linkedin"
        >
          Discover topics
        </Link>
        <Link
          href="/brand-profile"
          className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition hover:border-linkedin hover:text-linkedin"
        >
          Brand profile
        </Link>
        <Link
          href="/brand-memory"
          className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition hover:border-linkedin hover:text-linkedin"
        >
          Brand memory
        </Link>
        <Link
          href="/content-calendar"
          className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition hover:border-linkedin hover:text-linkedin"
        >
          Content calendar
        </Link>
      </div>
      <p className="mt-10 text-sm text-gray-400">
        Phase 1 MVP · Powered by Gemini 2.5 Flash
      </p>
    </main>
  );
}
