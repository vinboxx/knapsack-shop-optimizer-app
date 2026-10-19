import { describe, expect, it } from "vite-plus/test";
import {
  initialState,
  inventoryReducer,
  priorityNumbers,
  toSolverTiers,
  validate,
  type Action,
  type InventoryState,
} from "./inventory.ts";

const add = (id: string, cost: number | null, limit: number | null = null): Action => ({
  type: "addItem",
  item: { id, name: id, cost, limit },
});

const run = (...actions: Action[]): InventoryState =>
  actions.reduce(inventoryReducer, initialState);

const links = (state: InventoryState) => state.items.map((item) => item.linkedToPrev);
const ids = (state: InventoryState) => state.items.map((item) => item.id);

describe("auto-link", () => {
  it("links a new item to the row above when the costs match", () => {
    const state = run(add("guide", 18), add("design", 18), add("vision", 13), add("gold", 14));
    expect(links(state)).toEqual([false, true, false, false]);
    expect(priorityNumbers(state.items)).toEqual([1, 1, 2, 3]);
  });

  it("links when a cost edit makes it equal to the row above", () => {
    let state = run(add("a", 18), add("b", 20));
    expect(links(state)).toEqual([false, false]);
    state = inventoryReducer(state, { type: "updateItem", id: "b", patch: { cost: 18 } });
    expect(links(state)).toEqual([false, true]);
  });

  it("does not link on edits other than cost", () => {
    const state = run(
      add("a", 18),
      add("b", 18),
      { type: "toggleLink", id: "b" },
      {
        type: "updateItem",
        id: "b",
        patch: { name: "renamed", limit: 5 },
      },
    );
    expect(links(state)).toEqual([false, false]);
  });

  it("never re-links a pair the user unlinked by hand", () => {
    let state = run(add("a", 18), add("b", 18), { type: "toggleLink", id: "b" });
    expect(links(state)).toEqual([false, false]);
    state = inventoryReducer(state, { type: "updateItem", id: "b", patch: { cost: 20 } });
    state = inventoryReducer(state, { type: "updateItem", id: "b", patch: { cost: 18 } });
    expect(links(state)).toEqual([false, false]);
  });

  it("re-allows auto-link after the user links the pair again", () => {
    let state = run(add("a", 18), add("b", 18), { type: "toggleLink", id: "b" });
    state = inventoryReducer(state, { type: "toggleLink", id: "b" });
    expect(state.manualUnlinks).toEqual([]);
    expect(links(state)).toEqual([false, true]);
  });

  it("does not auto-link after a drag", () => {
    // c (18) is dragged up next to a (18); they stay unlinked.
    const state = run(add("a", 18), add("b", 13), add("c", 18), {
      type: "moveItem",
      from: 2,
      to: 1,
    });
    expect(ids(state)).toEqual(["a", "c", "b"]);
    expect(links(state)).toEqual([false, false, false]);
  });

  it("lets the user link rows with different prices", () => {
    const state = run(add("a", 18), add("b", 13), { type: "toggleLink", id: "b" });
    expect(links(state)).toEqual([false, true]);
  });
});

describe("dragging and tiers", () => {
  it("removes a dragged row from its tier", () => {
    const state = run(add("a", 18), add("b", 18), add("c", 13), {
      type: "moveItem",
      from: 1,
      to: 2,
    });
    expect(ids(state)).toEqual(["a", "c", "b"]);
    expect(priorityNumbers(state.items)).toEqual([1, 2, 3]);
  });

  it("keeps the rest of a tier linked when its middle row is dragged out", () => {
    const state = run(add("a", 5), add("b", 5), add("c", 5), add("d", 9), {
      type: "moveItem",
      from: 1,
      to: 3,
    });
    expect(ids(state)).toEqual(["a", "c", "d", "b"]);
    expect(priorityNumbers(state.items)).toEqual([1, 1, 2, 3]);
  });

  it("adds a row dropped between two linked rows to their tier", () => {
    const state = run(add("a", 18), add("b", 18), add("c", 13), {
      type: "moveItem",
      from: 2,
      to: 1,
    });
    expect(ids(state)).toEqual(["a", "c", "b"]);
    expect(priorityNumbers(state.items)).toEqual([1, 1, 1]);
  });

  it("keeps a tier when a row moves within it", () => {
    const state = run(add("a", 5), add("b", 5), add("c", 5), { type: "moveItem", from: 0, to: 1 });
    expect(ids(state)).toEqual(["b", "a", "c"]);
    expect(priorityNumbers(state.items)).toEqual([1, 1, 1]);
  });

  it("never links the top row to anything above it", () => {
    const state = run(add("a", 18), add("b", 18), add("c", 13), {
      type: "moveItem",
      from: 2,
      to: 0,
    });
    expect(links(state)).toEqual([false, false, true]);
  });
});

describe("items", () => {
  it("caps the list at 12 items", () => {
    const state = run(...Array.from({ length: 13 }, (_, i) => add(String(i), i + 1)));
    expect(state.items).toHaveLength(12);
  });

  it("removes a middle row and joins its tier neighbours", () => {
    const state = run(add("a", 5), add("b", 5), add("c", 5), { type: "removeItem", id: "b" });
    expect(links(state)).toEqual([false, true]);
  });

  it("forgets manual unlinks of removed rows", () => {
    const state = run(
      add("a", 5),
      add("b", 5),
      { type: "toggleLink", id: "b" },
      {
        type: "removeItem",
        id: "b",
      },
    );
    expect(state.manualUnlinks).toEqual([]);
  });

  it("builds solver tiers from linked rows", () => {
    const state = run(add("a", 18), add("b", 18), add("c", 13, 1175));
    expect(toSolverTiers(state.items)).toEqual([
      [
        { id: "a", cost: 18, limit: undefined },
        { id: "b", cost: 18, limit: undefined },
      ],
      [{ id: "c", cost: 13, limit: 1175 }],
    ]);
  });
});

describe("validate", () => {
  it("needs a budget, items and costs", () => {
    expect(validate(initialState).canCalculate).toBe(false);
    expect(validate(run({ type: "setBudget", budget: 100 })).canCalculate).toBe(false);
    expect(validate(run({ type: "setBudget", budget: 100 }, add("a", 5))).canCalculate).toBe(true);
    const missingCost = validate(run({ type: "setBudget", budget: 100 }, add("a", null)));
    expect(missingCost.items).toEqual({ a: { cost: "Cost required" } });
    expect(missingCost.canCalculate).toBe(false);
  });

  it("rejects out-of-range budgets and zero limits", () => {
    expect(validate(run({ type: "setBudget", budget: 0 })).budget).not.toBeNull();
    expect(validate(run({ type: "setBudget", budget: 1_000_001 })).budget).not.toBeNull();
    expect(validate(run({ type: "setBudget", budget: 10 }, add("a", 5, 0))).items).toEqual({
      a: { limit: "Must be at least 1" },
    });
  });
});
