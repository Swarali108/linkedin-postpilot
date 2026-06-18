import { NextRequest, NextResponse } from "next/server";
import { generatePost } from "@/lib/ai/content-generator";
import { retrieveContext } from "@/lib/rag/retrieve";
import { describeAiError } from "@/lib/ai/gemini";
import type { GenerationInput, Hook } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface RewriteBody extends Partial<GenerationInput> {
  hook?: Hook;
  useMemory?: boolean;
  userId?: string;
}

function isValid(b: RewriteBody): b is RewriteBody & GenerationInput & { hook: Hook } {
  return Boolean(
    b.topic?.trim() && b.postType && b.tone && b.goal && b.hook?.text
  );
}

/**
 * Rewrite just the post body around a different chosen hook — one LLM call,
 * so switching hooks in the UI is cheap. Hashtags and the visual prompt are
 * topic-driven and don't need regenerating.
 */
export async function POST(req: NextRequest) {
  let body: RewriteBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isValid(body)) {
    return NextResponse.json(
      { error: "Missing required fields: topic, postType, tone, goal, hook." },
      { status: 400 }
    );
  }

  try {
    let memoryBlock = "";
    if (body.useMemory) {
      const ctx = await retrieveContext(body.topic, body.userId || "local");
      memoryBlock = ctx.block;
    }
    const post = await generatePost(body, body.hook, memoryBlock);
    return NextResponse.json({ body: post });
  } catch (err) {
    const { message, status } = describeAiError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
