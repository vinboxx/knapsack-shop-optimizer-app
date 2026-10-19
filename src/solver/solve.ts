import {
  maxUnitsWithin,
  splitTier,
  tierCost,
  tierSegments,
  type Segment,
  type Tier,
} from "./tier.ts";

export const MAX_BUDGET = 1_000_000;
export const MAX_ITEMS = 12;

export interface Plan {
  /** Units to buy, by item id. */
  quantities: Record<string, number>;
  /** Units bought per tier, in priority order. */
  tierUnits: number[];
  spent: number;
  remainder: number;
  totalUnits: number;
}

export class SolverInputError extends Error {
  override name = "SolverInputError";
}

function isPositiveInteger(value: number) {
  return Number.isInteger(value) && value > 0;
}

function validate(tiers: readonly Tier[], budget: number) {
  if (!isPositiveInteger(budget) || budget > MAX_BUDGET) {
    throw new SolverInputError(`Budget must be a whole number from 1 to ${MAX_BUDGET}`);
  }
  const items = tiers.flat();
  if (items.length > MAX_ITEMS) {
    throw new SolverInputError(`At most ${MAX_ITEMS} items are supported`);
  }
  if (tiers.some((tier) => tier.length === 0)) {
    throw new SolverInputError("Every tier needs at least one item");
  }
  for (const item of items) {
    if (!isPositiveInteger(item.cost)) {
      throw new SolverInputError(`Cost of ${item.id} must be a positive whole number`);
    }
    if (item.limit !== undefined && !isPositiveInteger(item.limit)) {
      throw new SolverInputError(`Limit of ${item.id} must be a positive whole number`);
    }
  }
}

/**
 * Marks every spend reachable by adding some quantity of this tier to a spend
 * already reachable in `next`.
 *
 * Within a segment, for each partial round `r` the tier's possible costs are
 * `base + q·C` for `q` in `[0, count)`, an arithmetic progression. A running
 * count over each residue class mod C answers "is any of `next[s - base - q·C]`
 * reachable" in O(1) per `s`.
 */
function addTier(segments: readonly Segment[], next: Uint8Array, budget: number): Uint8Array {
  const reach = new Uint8Array(budget + 1);
  for (const segment of segments) {
    const stride = segment.roundCost;
    segment.prefixCost.forEach((prefix, r) => {
      const base = segment.startCost + prefix;
      if (base > budget) return;
      // r = 0 also covers the segment's end point (q = rounds).
      const count = r === 0 ? segment.rounds + 1 : segment.rounds;
      const span = budget - base;
      for (let start = 0; start < stride && start <= span; start++) {
        let window = 0;
        for (let t = start, q = 0; t <= span; t += stride, q++) {
          window += next[t]!;
          if (q >= count) window -= next[t - count * stride]!;
          if (window > 0) reach[base + t] = 1;
        }
      }
    });
  }
  return reach;
}

/**
 * Finds the purchasing plan that leaves the fewest unused coins. Among plans
 * with that remainder it buys the most units of tier 1, then of tier 2, and so on.
 */
export function solve(tiers: readonly Tier[], budget: number): Plan {
  validate(tiers, budget);
  const segments = tiers.map(tierSegments);

  // reach[j][s] = 1 when exactly `s` coins can be spent on tiers j and below.
  const reach: Uint8Array[] = new Array<Uint8Array>(tiers.length + 1);
  reach[tiers.length] = new Uint8Array(budget + 1);
  reach[tiers.length]![0] = 1;
  for (let j = tiers.length - 1; j >= 0; j--) {
    reach[j] = addTier(segments[j]!, reach[j + 1]!, budget);
  }

  let spent = budget;
  while (!reach[0]![spent]) spent--;

  const tierUnits: number[] = [];
  let left = spent;
  segments.forEach((tierSegs, j) => {
    let units = maxUnitsWithin(tierSegs, left);
    while (!reach[j + 1]![left - tierCost(tierSegs, units)]) units--;
    left -= tierCost(tierSegs, units);
    tierUnits.push(units);
  });

  return toPlan(tiers, segments, tierUnits, budget);
}

/**
 * Ignores the remainder: buys the most units of tier 1 that fit, then the most
 * of tier 2 with the coins left over, and so on. This is the strict priority
 * plan, which may leave coins that `solve` would have spent.
 */
export function solvePriorityFirst(tiers: readonly Tier[], budget: number): Plan {
  validate(tiers, budget);
  const segments = tiers.map(tierSegments);
  const tierUnits: number[] = [];
  let left = budget;
  for (const tierSegs of segments) {
    const units = maxUnitsWithin(tierSegs, left);
    left -= tierCost(tierSegs, units);
    tierUnits.push(units);
  }
  return toPlan(tiers, segments, tierUnits, budget);
}

function toPlan(
  tiers: readonly Tier[],
  segments: readonly Segment[][],
  tierUnits: number[],
  budget: number,
): Plan {
  const quantities: Record<string, number> = {};
  let spent = 0;
  tiers.forEach((tier, j) => {
    spent += tierCost(segments[j]!, tierUnits[j]!);
    const split = splitTier(tier, segments[j]!, tierUnits[j]!);
    tier.forEach((item, index) => {
      quantities[item.id] = split[index]!;
    });
  });

  return {
    quantities,
    tierUnits,
    spent,
    remainder: budget - spent,
    totalUnits: tierUnits.reduce((sum, units) => sum + units, 0),
  };
}

export interface Solution {
  /** Fewest coins left, then priority order (`solve`). */
  plan: Plan;
  /** Strict priority order (`solvePriorityFirst`), or null when it buys the same as `plan`. */
  alternative: Plan | null;
}

export function solveWithAlternative(tiers: readonly Tier[], budget: number): Solution {
  const plan = solve(tiers, budget);
  const priorityFirst = solvePriorityFirst(tiers, budget);
  const same = plan.tierUnits.every((units, j) => units === priorityFirst.tierUnits[j]);
  return { plan, alternative: same ? null : priorityFirst };
}
