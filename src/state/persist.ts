import { MAX_ITEMS } from "../solver/solve.ts";
import { initialState, type InventoryState, type Item } from "./inventory.ts";

const STORAGE_KEY = "kso:v1";

const isCount = (value: unknown): value is number | null =>
  value === null || (typeof value === "number" && Number.isInteger(value) && value >= 0);

function isItem(value: unknown): value is Item {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    isCount(item.cost) &&
    isCount(item.limit) &&
    typeof item.linkedToPrev === "boolean"
  );
}

function isState(value: unknown): value is InventoryState {
  if (typeof value !== "object" || value === null) return false;
  const state = value as Record<string, unknown>;
  return (
    isCount(state.budget) &&
    Array.isArray(state.items) &&
    state.items.length <= MAX_ITEMS &&
    state.items.every(isItem) &&
    Array.isArray(state.manualUnlinks) &&
    state.manualUnlinks.every((key) => typeof key === "string")
  );
}

export function loadState(): InventoryState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed: unknown = JSON.parse(raw);
    if (!isState(parsed)) return initialState;
    // The top row can never be linked upwards.
    const items = parsed.items.map((item, index) =>
      index === 0 ? { ...item, linkedToPrev: false } : item,
    );
    return { ...parsed, items };
  } catch {
    return initialState;
  }
}

export function saveState(state: InventoryState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be full or blocked (private mode); the app works without it.
  }
}
