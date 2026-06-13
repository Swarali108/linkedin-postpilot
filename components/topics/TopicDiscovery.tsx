"use client";

import { useState } from "react";
import Link from "next/link";
import type { TopicSuggestion } from "@/lib/types";

const CATEGORY_STYLES: Record<TopicSuggestion["category"], string> = {
  trending: "bg-rose-50 text-rose-600",
  personalized: "bg-violet-50 text-violet-600",
  story: "bg-amber-50 text-amber-600",
  learning: "bg-emerald-50 text-emerald-600",
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-linkedin focus:outline-none focus:ring-1 focus:ring-linkedin";

export default function TopicDiscovery() {
  const [industry, setIndustry] = useState("");
  const [interests, setInterests] = useState("");
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<TopicSuggestion[] | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!industry.trim()) {
      setError("Please enter your industry or field.");
      return;
    }
    setLoading(true);
    setError(null);
    setTopics(null);
    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry, interests, audience }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Topic generation failed.");
      setTopics(data.topics as TopicSuggestion[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:grid-cols-3"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Industry / field <span className="text-red-500">*</span>
          </label>
          <input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. AI engineering"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Interests <span className="text-gray-400">(optional)</span>
          </label>
          <input
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g. RAG, side projects"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Audience <span className="text-gray-400">(optional)</span>
          </label>
          <input
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g. junior devs"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-linkedin px-5 py-2.5 font-semibold text-white transition hover:bg-linkedin-dark disabled:opacity-60"
          >
            {loading ? "Finding topics…" : "Discover topics"}
          </button>
        </div>
        {error && (
          <p className="sm:col-span-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </form>

      {topics && (
        <div className="grid gap-3 sm:grid-cols-2">
          {topics.map((t, i) => (
            <div
              key={i}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <span
                className={`mb-2 w-fit rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${CATEGORY_STYLES[t.category]}`}
              >
                {t.category}
              </span>
              <h3 className="font-semibold text-gray-900">{t.title}</h3>
              <p className="mt-1 flex-1 text-sm text-gray-600">{t.angle}</p>
              <Link
                href={`/post-generator?topic=${encodeURIComponent(t.title)}`}
                className="mt-3 text-sm font-medium text-linkedin hover:underline"
              >
                Write this post →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
