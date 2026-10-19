export interface SolverItem {
  id: string;
  /** Coins per unit. Positive integer. */
  cost: number;
  /** Maximum units that can be bought. `undefined` means unbounded. */
  limit?: number;
}

/** Items that share one priority, in row order (top row first). */
export type Tier = readonly SolverItem[];

/**
 * A stretch of a tier's quantity range where the set of items still taking
 * units (the "active" items) does not change.
 *
 * Inside a segment every active item holds `level + q` units, and the first
 * `r` active rows hold one more, so for `T = startUnits + q·m + r`:
 *
 *   cost(T) = startCost + q·roundCost + prefixCost[r]
 */
export interface Segment {
  /** Units each active item holds at the start of the segment. */
  level: number;
  startUnits: number;
  startCost: number;
  /** Indexes into the tier of the active items, in row order. */
  active: number[];
  /** Full rounds before the next item reaches its limit (Infinity if none will). */
  rounds: number;
  /** Cost of one unit of every active item. */
  roundCost: number;
  /** `prefixCost[r]` is the cost of one unit of each of the first `r` active items. */
  prefixCost: number[];
}

export function tierSegments(tier: Tier): Segment[] {
  const segments: Segment[] = [];
  let active = tier.map((_, index) => index);
  let level = 0;
  let startUnits = 0;
  let startCost = 0;

  while (active.length > 0) {
    let nextLevel = Infinity;
    for (const index of active) {
      nextLevel = Math.min(nextLevel, tier[index]!.limit ?? Infinity);
    }
    const prefixCost = [0];
    for (const index of active) {
      prefixCost.push(prefixCost[prefixCost.length - 1]! + tier[index]!.cost);
    }
    const roundCost = prefixCost.pop()!;
    const rounds = nextLevel - level;
    segments.push({ level, startUnits, startCost, active, rounds, roundCost, prefixCost });

    if (rounds === Infinity) break;
    startUnits += rounds * active.length;
    startCost += rounds * roundCost;
    level = nextLevel;
    active = active.filter((index) => (tier[index]!.limit ?? Infinity) > level);
  }

  return segments;
}

/** Total units the tier can absorb (Infinity if any item is unbounded). */
export function maxUnits(segments: readonly Segment[]): number {
  const last = segments[segments.length - 1];
  if (!last) return 0;
  return last.startUnits + last.rounds * last.active.length;
}

function locate(segments: readonly Segment[], units: number) {
  for (const segment of segments) {
    const span = segment.rounds * segment.active.length;
    const offset = units - segment.startUnits;
    // The end of a segment equals the start of the next, so only the last
    // segment claims its own end point.
    if (offset < span || (segment === segments[segments.length - 1] && offset === span)) {
      const m = segment.active.length;
      return { segment, q: Math.floor(offset / m), r: offset % m };
    }
  }
  throw new RangeError(`Tier cannot hold ${units} units`);
}

/** Coins needed to buy `units` units of the tier, split by the Split Rule. */
export function tierCost(segments: readonly Segment[], units: number): number {
  if (units === 0) return 0;
  const { segment, q, r } = locate(segments, units);
  return segment.startCost + q * segment.roundCost + segment.prefixCost[r]!;
}

/** Largest number of units whose cost is at most `coins`. */
export function maxUnitsWithin(segments: readonly Segment[], coins: number): number {
  let best = 0;
  for (const segment of segments) {
    const left = coins - segment.startCost;
    if (left < 0) break;
    const q = Math.min(segment.rounds, Math.floor(left / segment.roundCost));
    let r = 0;
    if (q < segment.rounds) {
      const rest = left - q * segment.roundCost;
      while (r + 1 < segment.active.length && segment.prefixCost[r + 1]! <= rest) r++;
    }
    best = segment.startUnits + q * segment.active.length + r;
    if (q < segment.rounds) break;
  }
  return best;
}

/**
 * Split Rule: hand `units` out round-robin from the top row down. An item that
 * reaches its limit drops out and the rest share what is left.
 * Returns one quantity per tier item, in row order.
 */
export function splitTier(tier: Tier, segments: readonly Segment[], units: number): number[] {
  if (units === 0) return tier.map(() => 0);
  const { segment, q, r } = locate(segments, units);
  const quantities = tier.map((item) => item.limit ?? 0);
  segment.active.forEach((index, position) => {
    quantities[index] = segment.level + q + (position < r ? 1 : 0);
  });
  return quantities;
}
