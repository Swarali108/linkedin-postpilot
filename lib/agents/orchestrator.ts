import type { Agent, AgentState, AgentStep } from "./types";

/**
 * Run a sequence of agents, threading a shared state through each.
 *
 * This is a lightweight, dependency-free take on a LangGraph-style workflow:
 * agents run in order, each merges a patch into the state, and every step is
 * timed and recorded in a trace. An agent that throws aborts the run (its error
 * step is recorded and re-thrown so the caller can respond with a 5xx).
 */
export async function runPipeline(
  agents: Agent[],
  initialState: AgentState
): Promise<{ state: AgentState; trace: AgentStep[] }> {
  let state = initialState;
  const trace: AgentStep[] = [];

  for (const agent of agents) {
    if (agent.shouldRun && !agent.shouldRun(state)) {
      trace.push({
        name: agent.name,
        status: "skipped",
        durationMs: 0,
        summary: "skipped",
      });
      continue;
    }

    const start = Date.now();
    try {
      const patch = await agent.run(state);
      state = { ...state, ...patch };
      trace.push({
        name: agent.name,
        status: "ok",
        durationMs: Date.now() - start,
        summary: agent.summarize(patch),
      });
    } catch (err) {
      trace.push({
        name: agent.name,
        status: "error",
        durationMs: Date.now() - start,
        summary: err instanceof Error ? err.message : "failed",
      });
      // Attach the partial trace so callers can surface where it broke.
      const wrapped = new Error(
        `Agent "${agent.name}" failed: ${err instanceof Error ? err.message : String(err)}`
      );
      (wrapped as Error & { trace?: AgentStep[] }).trace = trace;
      throw wrapped;
    }
  }

  return { state, trace };
}
