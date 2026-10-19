import { solveWithAlternative, type Solution } from "./solve.ts";
import type { Tier } from "./tier.ts";

export interface SolveRequest {
  id: number;
  tiers: Tier[];
  budget: number;
}

export type SolveResponse =
  | { id: number; ok: true; solution: Solution }
  | { id: number; ok: false; error: string };

let worker: Worker | undefined;
let nextId = 0;
const pending = new Map<number, (response: SolveResponse) => void>();

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL("./solver.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (event: MessageEvent<SolveResponse>) => {
      pending.get(event.data.id)?.(event.data);
      pending.delete(event.data.id);
    };
  }
  return worker;
}

/** Runs the solver off the main thread, falling back to the main thread without Worker support. */
export function solveAsync(tiers: Tier[], budget: number): Promise<Solution> {
  if (typeof Worker === "undefined") {
    return new Promise((resolve) => resolve(solveWithAlternative(tiers, budget)));
  }
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, (response) => {
      if (response.ok) resolve(response.solution);
      else reject(new Error(response.error));
    });
    getWorker().postMessage({ id, tiers, budget } satisfies SolveRequest);
  });
}
