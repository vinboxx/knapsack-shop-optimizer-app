import { MAX_BUDGET, MAX_ITEMS } from "../solver/solve.ts";
import type { Tier } from "../solver/tier.ts";

export interface Item {
  id: string;
  name: string;
  cost: number | null;
  /** `null` means no purchase limit. */
  limit: number | null;
  /** Shares a tier with the row directly above. */
  linkedToPrev: boolean;
}

export interface InventoryState {
  budget: number | null;
  items: Item[];
  /** `"aboveId|belowId"` pairs the user unlinked by hand; auto-link skips them. */
  manualUnlinks: string[];
}

export type NewItem = Pick<Item, "id" | "name" | "cost" | "limit">;
export type ItemPatch = Partial<Pick<Item, "name" | "cost" | "limit">>;

export type Action =
  | { type: "setBudget"; budget: number | null }
  | { type: "addItem"; item: NewItem }
  | { type: "updateItem"; id: string; patch: ItemPatch }
  | { type: "removeItem"; id: string }
  | { type: "moveItem"; from: number; to: number }
  | { type: "toggleLink"; id: string }
  | { type: "clearItems" };

export const initialState: InventoryState = { budget: null, items: [], manualUnlinks: [] };

const pairKey = (above: Item, below: Item) => `${above.id}|${below.id}`;

/** Links `items[index]` to the row above when both cost the same. */
function autoLink(items: Item[], index: number, manualUnlinks: string[]): Item[] {
  const above = items[index - 1];
  const row = items[index];
  if (!above || !row || row.linkedToPrev || row.cost === null || row.cost !== above.cost) {
    return items;
  }
  if (manualUnlinks.includes(pairKey(above, row))) return items;
  return items.map((item, i) => (i === index ? { ...item, linkedToPrev: true } : item));
}

/**
 * Takes a row out of the list. The rows on either side stay linked only if the
 * removed row was linked to both of them.
 */
function takeOut(items: Item[], index: number): Item[] {
  const removed = items[index]!;
  return items
    .map((item, i) =>
      i === index + 1 ? { ...item, linkedToPrev: removed.linkedToPrev && item.linkedToPrev } : item,
    )
    .filter((_, i) => i !== index);
}

/** Puts a row at `index`. Dropping it between two linked rows adds it to their tier. */
function putIn(items: Item[], index: number, row: Item): Item[] {
  const below = items[index];
  const joins = index > 0 && below !== undefined && below.linkedToPrev;
  return [...items.slice(0, index), { ...row, linkedToPrev: joins }, ...items.slice(index)];
}

export function inventoryReducer(state: InventoryState, action: Action): InventoryState {
  switch (action.type) {
    case "setBudget":
      return { ...state, budget: action.budget };

    case "addItem": {
      if (state.items.length >= MAX_ITEMS) return state;
      const items = [...state.items, { ...action.item, linkedToPrev: false }];
      return { ...state, items: autoLink(items, items.length - 1, state.manualUnlinks) };
    }

    case "updateItem": {
      const index = state.items.findIndex((item) => item.id === action.id);
      if (index < 0) return state;
      const current = state.items[index]!;
      let items = state.items.map((item, i) => (i === index ? { ...item, ...action.patch } : item));
      if ("cost" in action.patch && action.patch.cost !== current.cost) {
        items = autoLink(items, index, state.manualUnlinks);
      }
      return { ...state, items };
    }

    case "removeItem": {
      const index = state.items.findIndex((item) => item.id === action.id);
      if (index < 0) return state;
      return {
        ...state,
        items: takeOut(state.items, index),
        manualUnlinks: state.manualUnlinks.filter((key) => !key.split("|").includes(action.id)),
      };
    }

    case "moveItem": {
      const { from, to } = action;
      const row = state.items[from];
      if (!row || from === to || to < 0 || to >= state.items.length) return state;
      return { ...state, items: putIn(takeOut(state.items, from), to, row) };
    }

    case "toggleLink": {
      const index = state.items.findIndex((item) => item.id === action.id);
      const above = state.items[index - 1];
      const row = state.items[index];
      if (!above || !row) return state;
      const key = pairKey(above, row);
      return {
        ...state,
        items: state.items.map((item, i) =>
          i === index ? { ...item, linkedToPrev: !item.linkedToPrev } : item,
        ),
        manualUnlinks: row.linkedToPrev
          ? [...state.manualUnlinks, key]
          : state.manualUnlinks.filter((existing) => existing !== key),
      };
    }

    case "clearItems":
      return { ...state, items: [], manualUnlinks: [] };
  }
}

/** Contiguous runs of linked rows, in priority order. */
export function groupTiers(items: readonly Item[]): Item[][] {
  const tiers: Item[][] = [];
  items.forEach((item, index) => {
    const last = tiers[tiers.length - 1];
    if (index > 0 && item.linkedToPrev && last) last.push(item);
    else tiers.push([item]);
  });
  return tiers;
}

/** Priority number per row; rows in one tier share it (e.g. 1, 1, 2, 3). */
export function priorityNumbers(items: readonly Item[]): number[] {
  return groupTiers(items).flatMap((tier, index) => tier.map(() => index + 1));
}

export function toSolverTiers(items: readonly Item[]): Tier[] {
  return groupTiers(items).map((tier) =>
    tier.map((item) => ({ id: item.id, cost: item.cost ?? 0, limit: item.limit ?? undefined })),
  );
}

export interface ItemErrors {
  cost?: string;
  limit?: string;
}

export interface Validation {
  budget: string | null;
  items: Record<string, ItemErrors>;
  canCalculate: boolean;
}

export function validate(state: InventoryState): Validation {
  let budget: string | null = null;
  if (state.budget === null) budget = "Enter your coin budget";
  else if (!Number.isInteger(state.budget) || state.budget < 1) budget = "Must be at least 1 coin";
  else if (state.budget > MAX_BUDGET) budget = `Max ${MAX_BUDGET.toLocaleString("en-US")} coins`;

  const items: Record<string, ItemErrors> = {};
  for (const item of state.items) {
    const errors: ItemErrors = {};
    if (item.cost === null) errors.cost = "Cost required";
    else if (item.cost < 1) errors.cost = "Must be at least 1";
    if (item.limit !== null && item.limit < 1) errors.limit = "Must be at least 1";
    if (errors.cost || errors.limit) items[item.id] = errors;
  }

  return {
    budget,
    items,
    canCalculate: budget === null && state.items.length > 0 && Object.keys(items).length === 0,
  };
}
