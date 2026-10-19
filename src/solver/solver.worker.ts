import { solve } from "./solve.ts";
import type { SolveRequest, SolveResponse } from "./client.ts";

self.onmessage = (event: MessageEvent<SolveRequest>) => {
  const { id, tiers, budget } = event.data;
  let response: SolveResponse;
  try {
    response = { id, ok: true, plan: solve(tiers, budget) };
  } catch (error) {
    response = { id, ok: false, error: error instanceof Error ? error.message : String(error) };
  }
  self.postMessage(response);
};
