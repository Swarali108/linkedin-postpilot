import { NextRequest, NextResponse } from "next/server";
import { evaluatePost } from "@/lib/ai/evaluator";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  let body: { post?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.post?.trim()) {
    return NextResponse.json(
      { error: "Missing required field: post." },
      { status: 400 }
    );
  }

  try {
    const evaluation = await evaluatePost(body.post);
    return NextResponse.json(evaluation);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Evaluation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
