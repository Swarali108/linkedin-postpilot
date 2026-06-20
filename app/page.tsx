import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* soft gradient glows */}
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />

      {/* Top nav */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 text-lg font-bold text-white">
            P
          </span>
          <span className="text-xl font-bold text-gray-900">PostPilot</span>
          <span className="hidden text-sm text-gray-400 sm:inline">
            Write LinkedIn posts that stop the scroll
          </span>
        </div>
        <Link
          href="/login"
          className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:opacity-90"
        >
          Login
        </Link>
      </header>

      {/* Hero + auth */}
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-10 lg:grid-cols-2 lg:py-20">
        {/* Left: hero */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-100/70 px-4 py-1.5 text-sm font-medium text-violet-700">
            ✦ Your Personal LinkedIn Operating System
          </span>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-gray-900 sm:text-6xl">
            Write LinkedIn posts that{" "}
            <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              stop the scroll
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-gray-600">
            Give PostPilot a topic. Get scroll-stopping hooks, a complete post in
            your chosen tone, reach-tiered hashtags, and a matching visual — in
            under a minute.
          </p>

          {/* feature pills */}
          <div className="mt-8 inline-flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-gray-200 bg-white/70 px-5 py-3 text-sm font-medium text-gray-700 shadow-sm backdrop-blur">
            <span className="flex items-center gap-2">⚡ Generate in seconds</span>
            <span className="hidden text-gray-200 sm:inline">|</span>
            <span className="flex items-center gap-2">🎯 Reach-tiered hashtags</span>
            <span className="hidden text-gray-200 sm:inline">|</span>
            <span className="flex items-center gap-2">✨ AI-powered creativity</span>
          </div>
        </div>

        {/* Right: auth card */}
        <div className="mx-auto w-full max-w-md lg:ml-auto">
          <AuthForm next="/dashboard" />
        </div>
      </div>

      {/* Footer pill */}
      <div className="flex justify-center pb-10">
        <span className="rounded-full border border-gray-200 bg-white/70 px-5 py-2 text-sm text-gray-400 shadow-sm backdrop-blur">
          ✦ Powered by Gemini · No card required to try it
        </span>
      </div>
    </main>
  );
}
