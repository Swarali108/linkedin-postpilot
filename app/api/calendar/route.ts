import { NextRequest, NextResponse } from "next/server";
import { generateCalendar, type CalendarParams } from "@/lib/ai/calendar-generator";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: Partial<CalendarParams>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.industry?.trim()) {
    return NextResponse.json(
      { error: "Missing required field: industry." },
      { status: 400 }
    );
  }

  // Clamp to sane bounds so a bad request can't ask for a 1000-post plan.
  const durationWeeks = Math.min(Math.max(Number(body.durationWeeks) || 1, 1), 4);
  const postsPerWeek = Math.min(Math.max(Number(body.postsPerWeek) || 3, 1), 7);

  try {
    const plan = await generateCalendar({
      industry: body.industry,
      interests: body.interests,
      audience: body.audience,
      brandProfile: body.brandProfile,
      durationWeeks,
      postsPerWeek,
      startDate: body.startDate || new Date().toISOString().slice(0, 10),
    });
    return NextResponse.json(plan);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Calendar generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
