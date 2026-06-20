import LandingCtas from "@/components/LandingCtas";

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
      <LandingCtas />
      <p className="mt-10 text-sm text-gray-400">
        Powered by Gemini · No card required to try it
      </p>
    </main>
  );
}
