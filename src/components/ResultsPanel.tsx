import type { Plan } from "../solver/solve.ts";
import type { Item } from "../state/inventory.ts";
import { tierAccent } from "./tierAccent.ts";

export interface SolvedResult {
  plan: Plan;
  /** Strict priority plan, shown only when it differs from `plan`. */
  alternative: Plan | null;
  budget: number;
  /** Rows as they were when the plan was calculated, grouped by tier. */
  tiers: Item[][];
}

interface ResultsPanelProps {
  result: SolvedResult | null;
  stale: boolean;
  error: string | null;
}

const format = (value: number) => value.toLocaleString("en-US");

function Metric({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-label-sm text-tactical uppercase">{label}</dt>
      <dd
        className={`mt-0.5 truncate font-mono text-code-num font-semibold sm:text-title-md ${tone}`}
      >
        {value}
      </dd>
    </div>
  );
}

function AlternativeCard({
  plan,
  alternative,
  tiers,
}: {
  plan: Plan;
  alternative: Plan;
  tiers: Item[][];
}) {
  const changes = tiers.flatMap((tier, t) =>
    tier
      .map((item) => ({
        item,
        priority: t + 1,
        qty: alternative.quantities[item.id] ?? 0,
        delta: (alternative.quantities[item.id] ?? 0) - (plan.quantities[item.id] ?? 0),
      }))
      .filter((change) => change.delta !== 0),
  );

  return (
    <section
      aria-labelledby="alternative-heading"
      className="rounded-base border border-dashed border-hairline bg-void/40 p-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="alternative-heading" className="font-mono text-label-sm text-tactical uppercase">
          Alternative · priority first
        </h3>
        <span className="font-mono text-label-sm text-gold uppercase">
          {format(alternative.remainder)} left
        </span>
      </div>
      <p className="mt-1 text-body-sm text-ghost">
        Buys more of your top priorities, but leaves {format(alternative.remainder)}{" "}
        {alternative.remainder === 1 ? "coin" : "coins"} unspent.
      </p>
      <ul className="mt-2 divide-y divide-layer">
        {changes.map(({ item, priority, qty, delta }) => (
          <li key={item.id} className="flex items-baseline gap-3 py-1.5">
            <span className={`w-8 shrink-0 font-mono text-label-sm ${tierAccent(priority).text}`}>
              P{String(priority).padStart(2, "0")}
            </span>
            <span
              className={`w-14 shrink-0 font-mono text-code-num ${qty === 0 ? "text-ghost" : "text-gold-bright"}`}
            >
              {format(qty)}×
            </span>
            <span className="min-w-0 flex-1 truncate text-body-md">
              {item.name.trim() || "Untitled item"}
            </span>
            <span
              className={`shrink-0 font-mono text-code-num ${delta > 0 ? "text-solved-bright" : "text-tactical"}`}
            >
              {delta > 0 ? "+" : "−"}
              {format(Math.abs(delta))}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 font-mono text-label-sm text-tactical">
        Spends {format(alternative.spent)} · {format(alternative.totalUnits)} items
      </p>
    </section>
  );
}

export function ResultsPanel({ result, stale, error }: ResultsPanelProps) {
  if (error) {
    return (
      <p
        role="alert"
        className="rounded-base border border-alert/60 bg-void p-3 text-body-md text-alert"
      >
        {error}
      </p>
    );
  }

  if (!result) {
    return (
      <div className="grid place-items-center rounded-base border border-dashed border-hairline px-4 py-10 text-center">
        <p className="font-mono text-label-md text-tactical uppercase">Awaiting calculation</p>
        <p className="mt-1 max-w-64 text-body-sm text-ghost">
          Set your budget and items, then press Calculate Strategy.
        </p>
      </div>
    );
  }

  const { plan, alternative, budget, tiers } = result;
  const solved = plan.remainder === 0;

  return (
    <div className={`flex flex-col gap-4 transition-opacity ${stale ? "opacity-50" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        {solved ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-solved bg-solved-deep px-3 py-1 font-mono text-label-sm text-solved-bright uppercase">
            <span className="size-1.5 animate-pulse rounded-full bg-solved-bright" />
            Zero remainder
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/60 bg-void px-3 py-1 font-mono text-label-sm text-gold uppercase">
            Best fit · {format(plan.remainder)} left
          </span>
        )}
        <span className="font-mono text-label-sm text-tactical">
          {((plan.spent / budget) * 100).toFixed(plan.spent === budget ? 0 : 1)}% used
        </span>
      </div>

      <div
        className="flex h-2 gap-px overflow-hidden rounded-sm bg-void"
        role="img"
        aria-label={`${format(plan.spent)} of ${format(budget)} coins spent`}
      >
        {tiers.flatMap((tier, t) =>
          tier.map((item) => {
            const spent = (plan.quantities[item.id] ?? 0) * (item.cost ?? 0);
            if (spent === 0) return null;
            return (
              <span
                key={item.id}
                className={`${tierAccent(t + 1).bar} h-full`}
                style={{ width: `${(spent / budget) * 100}%` }}
              />
            );
          }),
        )}
      </div>

      <ol className="flex flex-col gap-3">
        {tiers.map((tier, t) => (
          <li key={tier[0]!.id}>
            <p className={`mb-1 font-mono text-label-sm uppercase ${tierAccent(t + 1).text}`}>
              Priority {String(t + 1).padStart(2, "0")}
              {tier.length > 1 && <span className="text-ghost"> · {tier.length} linked</span>}
            </p>
            <ul className="divide-y divide-layer rounded-base border border-layer bg-void/60">
              {tier.map((item) => {
                const qty = plan.quantities[item.id] ?? 0;
                return (
                  <li
                    key={item.id}
                    className={`flex items-baseline gap-3 px-3 py-2 ${qty === 0 ? "text-ghost" : ""}`}
                  >
                    <span
                      className={`w-16 shrink-0 font-mono text-code-num ${qty === 0 ? "" : "text-gold-bright"}`}
                    >
                      {format(qty)}×
                    </span>
                    <span className="min-w-0 flex-1 truncate text-body-md">
                      {item.name.trim() || "Untitled item"}
                      <span className="ml-1.5 font-mono text-label-sm text-ghost">
                        @{item.cost}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-code-num">
                      {format(qty * (item.cost ?? 0))}
                    </span>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>

      {alternative && <AlternativeCard plan={plan} alternative={alternative} tiers={tiers} />}

      <dl className="sticky bottom-0 -mx-4 -mb-4 grid grid-cols-3 gap-3 rounded-b-lg border-t border-layer bg-pod/95 px-4 py-3 backdrop-blur-md">
        <Metric label="Total spent" value={format(plan.spent)} tone="text-frost" />
        <Metric
          label="Remaining"
          value={format(plan.remainder)}
          tone={solved ? "text-solved-bright" : "text-gold"}
        />
        <Metric label="Items" value={format(plan.totalUnits)} tone="text-frost" />
      </dl>
    </div>
  );
}
