import { NextRequest, NextResponse } from "next/server";
import { addMemory } from "@/lib/memory/store";
import { runPipeline } from "@/lib/agents/orchestrator";
import { CONTENT_PIPELINE } from "@/lib/agents/nodes";
import type { AgentState, AgentStep } from "@/lib/agents/types";
import type { GenerationInput } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface GenerateBody extends Partial<GenerationInput> {
  /** When true, retrieve the user's past posts and write in their style (RAG). */
  useMemory?: boolean;
  /** When true, save the generated post back into memory. */
  saveToMemory?: boolean;
  userId?: string;
}

function isValid(input: GenerateBody): input is GenerateBody & GenerationInput {
  return Boolean(
    input.topic?.trim() && input.postType && input.tone && input.goal
  );
}

export async function POST(req: NextRequest) {
  let input: GenerateBody;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isValid(input)) {
    return NextResponse.json(
      { error: "Missing required fields: topic, postType, tone, goal." },
      { status: 400 }
    );
  }

  const userId = input.userId || "local";

  const initialState: AgentState = {
    input,
    userId,
    useMemory: Boolean(input.useMemory),
  };

  try {
    // Run the agent pipeline: retrieval → hook → writer → hashtag → visual.
    const { state, trace } = await runPipeline(CONTENT_PIPELINE, initialState);

    // Optionally remember this post so future generations learn the user's voice.
    if (input.saveToMemory && state.body) {
      try {
        await addMemory(state.body, "generated", userId);
      } catch {
        // Saving to memory is best-effort; don't fail the response.
      }
    }

    return NextResponse.json({
      hooks: state.hooks,
      body: state.body,
      hashtags: state.hashtags,
      visual: state.visual,
      memoryUsed: state.memoryUsed ?? [],
      trace,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Generation failed unexpectedly.";
    const trace = (err as Error & { trace?: AgentStep[] }).trace;
    return NextResponse.json({ error: message, trace }, { status: 500 });
  }
}
