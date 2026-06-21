import { NextRequest, NextResponse } from "next/server";
import { generateTopics } from "@/lib/ai/topic-generator";
import { describeAiError } from "@/lib/ai/llm";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  let body: { industry?: string; interests?: string; audience?: string };
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

  try {
    const topics = await generateTopics({
      industry: body.industry,
      interests: body.interests,
      audience: body.audience,
    });
    return NextResponse.json({ topics });
  } catch (err) {
    const { message, status } = describeAiError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
