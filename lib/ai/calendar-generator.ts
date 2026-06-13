import { Type } from "@google/genai";
import { generateJSON } from "./gemini";
import { brandProfileBlock } from "./personalization";
import type {
  BrandProfile,
  CalendarPlan,
  PlannedPost,
  Weekday,
} from "../types";

const SYSTEM = `You are a LinkedIn content strategist who plans consistent, varied
posting calendars. A good plan rotates through 3-4 content pillars, mixes post
types (educational, story, opinion, carousel, personal-insight), and spaces topics
so the feed never feels repetitive. Topics must be specific, not generic.`;

const WEEKDAY_ORDER: Weekday[] = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    pillars: { type: Type.ARRAY, items: { type: Type.STRING } },
    posts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          week: { type: Type.NUMBER },
          weekday: {
            type: Type.STRING,
            enum: WEEKDAY_ORDER,
          },
          topic: { type: Type.STRING },
          postType: {
            type: Type.STRING,
            enum: [
              "educational",
              "story",
              "opinion",
              "carousel",
              "personal-insight",
            ],
          },
          angle: { type: Type.STRING },
          pillar: { type: Type.STRING },
        },
        required: ["week", "weekday", "topic", "postType", "angle", "pillar"],
      },
    },
  },
  required: ["pillars", "posts"],
};

export interface CalendarParams {
  industry: string;
  interests?: string;
  audience?: string;
  durationWeeks: number;
  postsPerWeek: number;
  brandProfile?: BrandProfile;
  /** Plan start date as ISO yyyy-mm-dd (so dates are deterministic / testable). */
  startDate: string;
}

interface RawPlan {
  pillars: string[];
  posts: PlannedPost[];
}

/** Map a (week, weekday) pair to a concrete ISO date relative to the start date.
 * All arithmetic is in UTC so it doesn't shift across timezones (parsing local
 * midnight and formatting as UTC would roll the date back in UTC+ zones). */
function computeDate(startDate: string, week: number, weekday: Weekday): string {
  const start = new Date(`${startDate}T00:00:00Z`);
  // getUTCDay(): 0=Sun..6=Sat. Convert to Mon=0..Sun=6.
  const startDow = (start.getUTCDay() + 6) % 7;
  const targetDow = WEEKDAY_ORDER.indexOf(weekday);
  const dayOffset = (week - 1) * 7 + (targetDow - startDow);
  const d = new Date(start);
  d.setUTCDate(start.getUTCDate() + dayOffset);
  return d.toISOString().slice(0, 10);
}

export async function generateCalendar(
  params: CalendarParams
): Promise<CalendarPlan> {
  const { industry, interests, audience, durationWeeks, postsPerWeek } = params;
  const total = durationWeeks * postsPerWeek;

  const prompt = `Create a ${durationWeeks}-week LinkedIn content calendar for someone in: ${industry}.
${interests ? `Interests: ${interests}.` : ""}
${audience ? `Audience: ${audience}.` : ""}
${brandProfileBlock(params.brandProfile)}
Plan exactly ${postsPerWeek} posts per week (${total} posts total).
Define 3-4 content pillars and rotate through them. Vary the post types and weekdays.

Return a JSON object with:
- "pillars": array of the 3-4 content pillar names
- "posts": array of exactly ${total} objects, each with:
  - "week": 1-${durationWeeks}
  - "weekday": one of Mon/Tue/Wed/Thu/Fri/Sat/Sun
  - "topic": a specific post topic
  - "postType": educational | story | opinion | carousel | personal-insight
  - "angle": a one-line hook/angle
  - "pillar": which pillar (must match one in "pillars")

Return ONLY the JSON object.`;

  const raw = await generateJSON<RawPlan>(prompt, SYSTEM, SCHEMA);

  const posts: PlannedPost[] = (raw.posts ?? [])
    .map((p) => ({
      ...p,
      date: computeDate(params.startDate, p.week, p.weekday),
    }))
    .sort((a, b) => (a.date! < b.date! ? -1 : a.date! > b.date! ? 1 : 0));

  return {
    durationWeeks,
    postsPerWeek,
    pillars: raw.pillars ?? [],
    posts,
  };
}
