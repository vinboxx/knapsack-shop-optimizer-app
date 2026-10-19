import { useEffect, useReducer, useRef, useState, type ReactNode } from "react";
import { AddItemBar, PresetCatalog } from "./components/AddItems.tsx";
import { BudgetInput } from "./components/BudgetInput.tsx";
import { PriorityList } from "./components/PriorityList.tsx";
import { ResultsPanel, type SolvedResult } from "./components/ResultsPanel.tsx";
import type { Preset } from "./data/presets.ts";
import { solveAsync } from "./solver/client.ts";
import { MAX_ITEMS } from "./solver/solve.ts";
import {
  groupTiers,
  inventoryReducer,
  toSolverTiers,
  validate,
  type InventoryState,
} from "./state/inventory.ts";
import { loadState, saveState } from "./state/persist.ts";

function newId() {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

/** Identifies the solver input, so a result can tell when it is out of date. */
const inputKey = (state: InventoryState) =>
  JSON.stringify([state.budget, toSolverTiers(state.items)]);

function Pod({
  title,
  aside,
  className = "",
  children,
}: {
  title: string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const id = `pod-${title.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <section aria-labelledby={id} className={`pod p-4 ${className}`}>
      <header className="mb-4 flex items-center justify-between gap-2">
        <h2 id={id} className="font-display text-title-md text-frost">
          {title}
        </h2>
        {aside}
      </header>
      {children}
    </section>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(inventoryReducer, undefined, loadState);
  const [result, setResult] = useState<(SolvedResult & { key: string }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [solving, setSolving] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => saveState(state), [state]);

  const validation = validate(state);
  const stale = result !== null && result.key !== inputKey(state);
  const hint =
    validation.budget ??
    (state.items.length === 0
      ? "Add at least one item"
      : state.items.some((item) => item.cost === null)
        ? "Enter a cost for every item"
        : validation.canCalculate
          ? null
          : "Fix the highlighted fields");

  const addItem = (preset: Preset | null) => {
    const id = newId();
    dispatch({
      type: "addItem",
      item: { id, name: preset?.name ?? "", cost: preset?.cost ?? null, limit: null },
    });
    setFocusId(preset ? null : id);
  };

  const calculate = async () => {
    if (!validation.canCalculate || state.budget === null || solving) return;
    const key = inputKey(state);
    const budget = state.budget;
    const tiers = groupTiers(state.items);
    setSolving(true);
    setError(null);
    try {
      const { plan, alternative } = await solveAsync(toSolverTiers(state.items), budget);
      setResult({ plan, alternative, budget, tiers, key });
      if (window.matchMedia("(max-width: 1023px)").matches) {
        outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The solver failed. Try again.");
    } finally {
      setSolving(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
      <header>
        <p className="font-mono text-label-sm text-gold uppercase">Priority coin ledger</p>
        <h1 className="mt-1 font-display text-headline-xl-mobile text-frost lg:text-headline-xl">
          Knapsack Shop Optimizer
        </h1>
        <p className="mt-2 max-w-2xl text-body-md text-tactical">
          Rank what you want, set your coins, and get a plan that spends every coin it can,
          favouring your top priorities.
        </p>
      </header>

      <main className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <Pod title="Inventory" className="hidden lg:col-span-3 lg:block">
          <PresetCatalog count={state.items.length} onAdd={addItem} />
        </Pod>

        <Pod
          title="Solver parameters"
          className="lg:col-span-5"
          aside={
            <span
              className={`font-mono text-label-sm ${state.items.length >= MAX_ITEMS ? "text-gold" : "text-tactical"}`}
            >
              {String(state.items.length).padStart(2, "0")}/{MAX_ITEMS} items
            </span>
          }
        >
          <form
            className="flex flex-col gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              void calculate();
            }}
          >
            <BudgetInput
              value={state.budget}
              error={validation.budget}
              onChange={(budget) => dispatch({ type: "setBudget", budget })}
            />

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="font-mono text-label-sm text-tactical uppercase">
                  Priority order <span className="text-ghost normal-case">· top = highest</span>
                </h3>
                {state.items.length > 0 && (
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "clearItems" })}
                    className="font-mono text-label-sm text-ghost uppercase hover:text-alert"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <PriorityList
                items={state.items}
                errors={validation.items}
                focusId={focusId}
                dispatch={dispatch}
              />
            </div>

            <div className="lg:hidden">
              <AddItemBar count={state.items.length} onAdd={addItem} />
            </div>

            <div>
              <button
                type="submit"
                disabled={!validation.canCalculate || solving}
                className="h-12 w-full rounded-base border border-gold border-t-gold-light bg-gold font-mono text-label-md font-bold text-void uppercase transition-shadow hover:shadow-auric disabled:cursor-not-allowed disabled:border-hairline disabled:bg-layer disabled:text-ghost disabled:shadow-none"
              >
                {solving ? "Solving…" : "Calculate Strategy"}
              </button>
              {hint && <p className="mt-2 text-center text-body-sm text-ghost">{hint}</p>}
            </div>
          </form>
        </Pod>

        <div ref={outputRef} className="scroll-mt-4 lg:sticky lg:top-8 lg:col-span-4">
          <Pod
            title="Optimized output"
            className={result && !stale && result.plan.remainder === 0 ? "shadow-solved" : ""}
            aside={
              stale && (
                <span role="status" className="font-mono text-label-sm text-gold uppercase">
                  Inputs changed · recalculate
                </span>
              )
            }
          >
            <ResultsPanel result={result} stale={stale} error={error} />
          </Pod>
        </div>
      </main>
    </div>
  );
}
