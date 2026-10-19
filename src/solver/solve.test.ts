import { describe, expect, it } from "vite-plus/test";
import { MAX_BUDGET, SolverInputError, solve } from "./solve.ts";
import { maxUnits, splitTier, tierCost, tierSegments, type SolverItem, type Tier } from "./tier.ts";

const item = (id: string, cost: number, limit?: number): SolverItem => ({ id, cost, limit });

/** The Split Rule, one unit at a time. */
function naiveSplit(tier: Tier, units: number): number[] {
  const quantities = tier.map(() => 0);
  let left = units;
  while (left > 0) {
    let handedOut = false;
    tier.forEach((entry, index) => {
      if (left > 0 && quantities[index]! < (entry.limit ?? Infinity)) {
        quantities[index]!++;
        left--;
        handedOut = true;
      }
    });
    if (!handedOut) throw new RangeError("Tier is full");
  }
  return quantities;
}

function naiveCost(tier: Tier, units: number) {
  return naiveSplit(tier, units).reduce((sum, qty, index) => sum + qty * tier[index]!.cost, 0);
}

function lexGreater(a: number[], b: number[]) {
  const k = a.findIndex((value, index) => value !== b[index]);
  return k >= 0 && a[k]! > b[k]!;
}

/** Tries every combination of tier totals. */
function bruteForce(tiers: Tier[], budget: number) {
  let best: { remainder: number; units: number[] } | undefined;
  const units: number[] = [];
  const visit = (j: number, left: number) => {
    if (j === tiers.length) {
      if (
        !best ||
        left < best.remainder ||
        (left === best.remainder && lexGreater(units, best.units))
      ) {
        best = { remainder: left, units: [...units] };
      }
      return;
    }
    const tier = tiers[j]!;
    const cap = Math.min(maxUnits(tierSegments(tier)), budget);
    for (let t = 0; t <= cap; t++) {
      const cost = naiveCost(tier, t);
      if (cost > left) break;
      units.push(t);
      visit(j + 1, left - cost);
      units.pop();
    }
  };
  visit(0, budget);
  return best!;
}

function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
}

describe("splitTier", () => {
  it("splits evenly and gives the extra unit to the higher row", () => {
    const tier = [item("a", 18), item("b", 18)];
    expect(splitTier(tier, tierSegments(tier), 83)).toEqual([42, 41]);
    expect(splitTier(tier, tierSegments(tier), 82)).toEqual([41, 41]);
  });

  it("drops an item that reaches its limit and shares the rest", () => {
    const tier = [item("a", 5, 3), item("b", 7), item("c", 9, 6)];
    const segments = tierSegments(tier);
    expect(splitTier(tier, segments, 10)).toEqual([3, 4, 3]);
    expect(splitTier(tier, segments, 20)).toEqual([3, 11, 6]);
  });

  it("matches the round-robin Split Rule for every quantity", () => {
    const tier = [item("a", 4, 2), item("b", 3), item("c", 5, 5), item("d", 2, 2)];
    const segments = tierSegments(tier);
    for (let units = 0; units <= 40; units++) {
      expect(splitTier(tier, segments, units)).toEqual(naiveSplit(tier, units));
      expect(tierCost(segments, units)).toBe(naiveCost(tier, units));
    }
  });

  it("knows the capacity of a bounded tier", () => {
    const tier = [item("a", 4, 2), item("b", 3, 7)];
    const segments = tierSegments(tier);
    expect(maxUnits(segments)).toBe(9);
    expect(splitTier(tier, segments, 9)).toEqual([2, 7]);
    expect(() => tierCost(segments, 10)).toThrow(RangeError);
  });
});

describe("solve", () => {
  it("solves the spec walkthrough exactly (section 4)", () => {
    const plan = solve([[item("18", 18)], [item("13", 13, 1175)], [item("14", 14)]], 1555);
    expect(plan.quantities).toEqual({ "18": 82, "13": 5, "14": 1 });
    expect(plan.spent).toBe(1555);
    expect(plan.remainder).toBe(0);
    expect(plan.totalUnits).toBe(88);
  });

  it("splits a linked tier evenly (section 4.1)", () => {
    const plan = solve(
      [[item("guide", 18), item("design", 18)], [item("vision", 13, 1175)], [item("gold", 14)]],
      1555,
    );
    expect(plan.quantities).toEqual({ guide: 41, design: 41, vision: 5, gold: 1 });
    expect(plan.tierUnits).toEqual([82, 5, 1]);
    expect(plan.remainder).toBe(0);
  });

  it("buys only the higher row when the same items are unlinked (section 4.1)", () => {
    const plan = solve(
      [[item("guide", 18)], [item("design", 18)], [item("vision", 13, 1175)], [item("gold", 14)]],
      1555,
    );
    expect(plan.quantities).toEqual({ guide: 82, design: 0, vision: 5, gold: 1 });
    expect(plan.remainder).toBe(0);
  });

  it("gives the extra unit of an uneven tier split to the higher row", () => {
    const plan = solve([[item("a", 10), item("b", 10)]], 30);
    expect(plan.quantities).toEqual({ a: 2, b: 1 });
  });

  it("moves units to the rest of the tier when an item hits its limit", () => {
    const plan = solve([[item("a", 10, 2), item("b", 10)], [item("c", 3)]], 100);
    expect(plan.quantities).toEqual({ a: 2, b: 8, c: 0 });
    expect(plan.remainder).toBe(0);
  });

  it("falls back to lower tiers once a limit is reached", () => {
    const plan = solve([[item("a", 10, 3)], [item("b", 7)]], 100);
    expect(plan.quantities).toEqual({ a: 3, b: 10 });
    expect(plan.remainder).toBe(0);
  });

  it("spends a large budget on unbounded items", () => {
    const plan = solve([[item("a", 7)], [item("b", 1)]], MAX_BUDGET);
    expect(plan.quantities).toEqual({ a: 142857, b: 1 });
    expect(plan.remainder).toBe(0);
  });

  it("minimises the remainder when no exact match exists", () => {
    const plan = solve([[item("a", 4)], [item("b", 6)]], 11);
    expect(plan.remainder).toBe(1);
    expect(plan.quantities).toEqual({ a: 1, b: 1 });
  });

  it("spends nothing when every item costs more than the budget", () => {
    const plan = solve([[item("a", 7)]], 5);
    expect(plan).toMatchObject({ spent: 0, remainder: 5, totalUnits: 0, quantities: { a: 0 } });
  });

  it("prefers a smaller remainder over more units of a higher tier", () => {
    // 3×5 = 15 leaves 1 coin; 2×5 + 6 = 16 leaves none.
    const plan = solve([[item("a", 5)], [item("b", 6)]], 16);
    expect(plan.quantities).toEqual({ a: 2, b: 1 });
    expect(plan.remainder).toBe(0);
  });

  it("matches a brute-force search on random small inputs", () => {
    const random = seeded(42);
    const int = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
    let id = 0;
    for (let run = 0; run < 150; run++) {
      const tiers: Tier[] = Array.from({ length: int(1, 4) }, () =>
        Array.from({ length: int(1, 3) }, () =>
          item(String(id++), int(1, 25), random() < 0.5 ? int(1, 8) : undefined),
        ),
      );
      const budget = int(1, 150);
      const expected = bruteForce(tiers, budget);
      const plan = solve(tiers, budget);
      expect({ remainder: plan.remainder, units: plan.tierUnits }).toEqual(expected);
      tiers.forEach((tier, j) => {
        expect(tier.map((entry) => plan.quantities[entry.id])).toEqual(
          naiveSplit(tier, plan.tierUnits[j]!),
        );
      });
    }
  });

  it("rejects invalid input", () => {
    expect(() => solve([[item("a", 1)]], 0)).toThrow(SolverInputError);
    expect(() => solve([[item("a", 1)]], MAX_BUDGET + 1)).toThrow(SolverInputError);
    expect(() => solve([[item("a", 1.5)]], 10)).toThrow(SolverInputError);
    expect(() => solve([[item("a", 1, 0)]], 10)).toThrow(SolverInputError);
    expect(() => solve([[]], 10)).toThrow(SolverInputError);
    const thirteen = Array.from({ length: 13 }, (_, i) => [item(String(i), 1)]);
    expect(() => solve(thirteen, 10)).toThrow(SolverInputError);
  });
});
