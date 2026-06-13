import Link from "next/link";
import BrandProfileForm from "@/components/profile/BrandProfileForm";

export default function BrandProfilePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <Link href="/" className="text-sm text-linkedin hover:underline">
          ← PostPilot
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Brand Profile</h1>
        <p className="text-gray-600">
          Tell PostPilot who you are. Every generated post will sound like you —
          your role, your audience, your voice.
        </p>
      </header>
      <BrandProfileForm />
    </main>
  );
}
