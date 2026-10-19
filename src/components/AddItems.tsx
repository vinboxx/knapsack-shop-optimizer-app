import { useState } from "react";
import { PRESETS, type Preset } from "../data/presets.ts";
import { MAX_ITEMS } from "../solver/solve.ts";
import { CoinIcon, PlusIcon } from "./icons.tsx";

interface AddItemsProps {
  count: number;
  onAdd: (preset: Preset | null) => void;
}

const secondaryButton =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-base border border-hairline bg-layer px-3 font-mono text-label-md text-frost uppercase transition-colors hover:border-tactical disabled:cursor-not-allowed disabled:border-layer disabled:bg-pod disabled:text-ghost";

function FullHint({ count }: { count: number }) {
  if (count < MAX_ITEMS) return null;
  return (
    <p className="text-body-sm text-gold" role="status">
      {MAX_ITEMS} of {MAX_ITEMS} items. Remove one to add another.
    </p>
  );
}

/** Desktop catalog: one card per preset. */
export function PresetCatalog({ count, onAdd }: AddItemsProps) {
  const full = count >= MAX_ITEMS;
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {PRESETS.map((preset) => (
          <li key={preset.name}>
            <button
              type="button"
              disabled={full}
              onClick={() => onAdd(preset)}
              className="group flex w-full items-center gap-3 rounded-base border border-layer bg-layer/60 p-2.5 text-left transition-colors hover:border-hairline hover:bg-lift disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-layer disabled:hover:bg-layer/60"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-base border border-hairline bg-void text-gold">
                <CoinIcon className="size-4" />
              </span>
              <span className="min-w-0 flex-1 truncate text-body-md text-frost">{preset.name}</span>
              <span className="font-mono text-code-num text-gold-bright">{preset.cost}</span>
              <PlusIcon className="size-4 text-ghost group-hover:text-frost" />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" disabled={full} onClick={() => onAdd(null)} className={secondaryButton}>
        <PlusIcon className="size-4" /> Custom item
      </button>
      <FullHint count={count} />
    </div>
  );
}

/** Compact add bar for small screens. */
export function AddItemBar({ count, onAdd }: AddItemsProps) {
  const [choice, setChoice] = useState("");
  const full = count >= MAX_ITEMS;
  const add = () => {
    onAdd(PRESETS.find((preset) => preset.name === choice) ?? null);
    setChoice("");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <select
          value={choice}
          onChange={(event) => setChoice(event.target.value)}
          disabled={full}
          aria-label="Item to add"
          className="recess h-10 min-w-0 flex-1 px-2 text-body-md text-frost outline-none disabled:text-ghost"
        >
          <option value="">Custom item</option>
          {PRESETS.map((preset) => (
            <option key={preset.name} value={preset.name}>
              {preset.name} · {preset.cost}
            </option>
          ))}
        </select>
        <button type="button" disabled={full} onClick={add} className={secondaryButton}>
          <PlusIcon className="size-4" /> Add
        </button>
      </div>
      <FullHint count={count} />
    </div>
  );
}
