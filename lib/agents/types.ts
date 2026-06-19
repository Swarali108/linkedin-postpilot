import type {
  GeneratedPost,
  GenerationInput,
  Hook,
  HashtagGroups,
  MemoryHit,
  PostEvaluation,
  VisualCard,
} from "../types";

/** The named agents in the content-generation workflow (design doc Phase 5). */
export type AgentName =
  | "retrieval"
  | "hook"
  | "writer"
  | "hashtag"
  | "visual"
  | "evaluator";

/**
 * Shared state threaded through the agent pipeline. Each agent reads what it
 * needs and returns a partial patch that the orchestrator merges in.
 */
export interface AgentState {
  // Inputs
  input: GenerationInput;
  userId: string;
  useMemory: boolean;

  // Produced by agents, in order
  memoryBlock?: string;
  memoryUsed?: MemoryHit[];
  hooks?: Hook[];
  selectedHook?: Hook;
  body?: string;
  hashtags?: HashtagGroups;
  visual?: VisualCard;
  evaluation?: PostEvaluation;
}

export type AgentStatus = "ok" | "error" | "skipped";

/** One entry in the execution trace, surfaced to the UI for observability. */
export interface AgentStep {
  name: AgentName;
  status: AgentStatus;
  durationMs: number;
  /** Short human-readable summary of what the agent produced. */
  summary: string;
}

/** An agent reads the current state and returns a patch to merge in.
 * Throwing aborts the pipeline (the orchestrator records the error step). */
export interface Agent {
  name: AgentName;
  run(state: AgentState): Promise<Partial<AgentState>>;
  /** Optional: skip this agent for the current state (e.g. retrieval when memory is off). */
  shouldRun?(state: AgentState): boolean;
  /** Build the trace summary from the patch this agent produced. */
  summarize(patch: Partial<AgentState>): string;
}

/** The full result of a pipeline run. */
export interface OrchestratorResult {
  post: GeneratedPost & { memoryUsed: MemoryHit[] };
  trace: AgentStep[];
}
