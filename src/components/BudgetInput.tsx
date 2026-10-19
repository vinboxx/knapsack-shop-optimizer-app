import { MAX_BUDGET } from "../solver/solve.ts";
import { CoinIcon, MinusIcon, PlusIcon } from "./icons.tsx";
import { NumberField } from "./NumberField.tsx";

interface BudgetInputProps {
  value: number | null;
  error: string | null;
  onChange: (value: number | null) => void;
}

export function BudgetInput({ value, error, onChange }: BudgetInputProps) {
  const step = (delta: number) => onChange(Math.min(MAX_BUDGET, Math.max(1, (value ?? 0) + delta)));
  const showError = error !== null && value !== null;

  return (
    <div>
      <label htmlFor="budget" className="font-mono text-label-sm text-tactical uppercase">
        Total coins
      </label>
      <div
        className={`recess mt-1 flex h-12 items-stretch ${showError ? "border-alert focus-within:border-alert" : ""}`}
      >
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={value === null || value <= 1}
          aria-label="Decrease budget"
          className="grid w-11 shrink-0 place-items-center border-r border-hairline text-tactical hover:text-frost disabled:text-ghost"
        >
          <MinusIcon className="size-4" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
          <CoinIcon className="size-5 shrink-0 text-gold" />
          <NumberField
            id="budget"
            value={value}
            onChange={onChange}
            placeholder="e.g. 1555"
            aria-invalid={showError}
            aria-describedby={showError ? "budget-error" : undefined}
            className="w-full text-title-md"
          />
        </div>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={value !== null && value >= MAX_BUDGET}
          aria-label="Increase budget"
          className="grid w-11 shrink-0 place-items-center border-l border-hairline text-tactical hover:text-frost disabled:text-ghost"
        >
          <PlusIcon className="size-4" />
        </button>
      </div>
      {showError && (
        <p id="budget-error" className="mt-1 text-body-sm text-alert">
          {error}
        </p>
      )}
    </div>
  );
}
