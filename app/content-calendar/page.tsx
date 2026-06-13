import Link from "next/link";
import ContentCalendar from "@/components/calendar/ContentCalendar";

export default function ContentCalendarPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <Link href="/" className="text-sm text-linkedin hover:underline">
          ← PostPilot
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Content Calendar
        </h1>
        <p className="text-gray-600">
          Plan a consistent posting schedule. PostPilot rotates content pillars
          and post types across the weeks — click any day to write the post.
        </p>
      </header>
      <ContentCalendar />
    </main>
  );
}
