import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ItemErrors, ItemPatch, Item } from "../state/inventory.ts";
import { CoinIcon, GripIcon, LinkIcon, TrashIcon, UnlinkIcon } from "./icons.tsx";
import { NumberField } from "./NumberField.tsx";
import { tierAccent } from "./tierAccent.ts";

interface ItemRowProps {
  item: Item;
  above: Item | undefined;
  priority: number;
  /** Where the row sits in a tier of two or more; `null` for a tier of one. */
  bracket: "top" | "middle" | "bottom" | null;
  errors: ItemErrors | undefined;
  autoFocus: boolean;
  listDragging: boolean;
  onChange: (patch: ItemPatch) => void;
  onRemove: () => void;
  onToggleLink: () => void;
}

export function ItemRow({
  item,
  above,
  priority,
  bracket,
  errors,
  autoFocus,
  listDragging,
  onChange,
  onRemove,
  onToggleLink,
}: ItemRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });
  const accent = tierAccent(priority);
  const label = item.name.trim() || "Untitled item";
  // An empty cost is explained under the Calculate button; only flag values the user typed.
  const costError = item.cost === null ? undefined : errors?.cost;

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`relative ${isDragging ? "z-10" : ""}`}
    >
      {above && (
        <div className="relative flex h-9 items-center">
          <div className="relative h-full w-3 shrink-0">
            {item.linkedToPrev && !isDragging && (
              <span className={`absolute inset-y-0 left-1 w-0.5 ${accent.bar}`} />
            )}
          </div>
          <div className="flex flex-1 justify-center">
            <button
              type="button"
              onClick={onToggleLink}
              aria-pressed={item.linkedToPrev}
              aria-label={`${item.linkedToPrev ? "Unlink" : "Link"} ${above.name || "item above"} and ${label}`}
              title={
                item.linkedToPrev
                  ? "Linked: same priority. Tap to unlink."
                  : "Tap to give both rows the same priority"
              }
              className={`group grid size-11 place-items-center transition-opacity ${listDragging ? "pointer-events-none opacity-0" : ""}`}
            >
              <span
                className={`grid size-7 place-items-center rounded-full border transition-colors ${
                  item.linkedToPrev
                    ? "border-solved bg-solved-deep text-solved-bright shadow-solved"
                    : "border-hairline bg-pod text-ghost group-hover:border-tactical group-hover:text-tactical"
                }`}
              >
                {item.linkedToPrev ? (
                  <LinkIcon className="size-3.5" />
                ) : (
                  <UnlinkIcon className="size-3.5" />
                )}
              </span>
            </button>
          </div>
        </div>
      )}

      <div className="flex items-stretch">
        <div className="relative w-3 shrink-0" aria-hidden>
          {bracket && (
            <>
              <span
                className={`absolute left-1 w-0.5 ${accent.bar} ${
                  bracket === "top"
                    ? "top-1/2 bottom-0"
                    : bracket === "bottom"
                      ? "top-0 bottom-1/2"
                      : "inset-y-0"
                }`}
              />
              {bracket !== "middle" && (
                <span className={`absolute top-1/2 left-1 h-0.5 w-2 ${accent.bar}`} />
              )}
            </>
          )}
        </div>

        <div
          className={`flex flex-1 gap-2 rounded-base border border-l-2 border-hairline bg-layer p-2 transition-shadow ${accent.border} ${
            isDragging ? "bg-lift shadow-auric" : ""
          }`}
        >
          <div className="flex w-8 shrink-0 flex-col items-center gap-1">
            <span
              className={`font-mono text-label-md font-semibold ${accent.text}`}
              aria-label={`Priority ${priority}`}
            >
              {String(priority).padStart(2, "0")}
            </span>
            <button
              type="button"
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
              aria-label={`Reorder ${label}`}
              className="grid h-10 w-8 cursor-grab touch-manipulation place-items-center rounded-base text-ghost hover:bg-lift hover:text-tactical active:cursor-grabbing"
            >
              <GripIcon className="size-5" />
            </button>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <input
              type="text"
              value={item.name}
              onChange={(event) => onChange({ name: event.target.value })}
              placeholder="Item name"
              aria-label="Item name"
              autoFocus={autoFocus}
              className="recess h-9 w-full px-2 text-body-md text-frost outline-none focus:border-gold"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  className={`recess flex h-9 items-center gap-1.5 px-2 ${costError ? "border-alert focus-within:border-alert" : ""}`}
                >
                  <CoinIcon className="size-4 shrink-0 text-gold" />
                  <span className="sr-only">Cost per unit</span>
                  <NumberField
                    value={item.cost}
                    onChange={(cost) => onChange({ cost })}
                    placeholder="Cost"
                    aria-invalid={Boolean(costError)}
                    className="w-full"
                  />
                </label>
                {costError && <p className="mt-0.5 text-body-sm text-alert">{costError}</p>}
              </div>
              <div>
                <label
                  className={`recess flex h-9 items-center gap-1.5 px-2 ${errors?.limit ? "border-alert focus-within:border-alert" : ""}`}
                >
                  <span className="font-mono text-label-sm text-tactical uppercase">Max</span>
                  <span className="sr-only">Purchase limit (optional)</span>
                  <NumberField
                    value={item.limit}
                    onChange={(limit) => onChange({ limit })}
                    placeholder="∞"
                    aria-invalid={Boolean(errors?.limit)}
                    className="w-full"
                  />
                </label>
                {errors?.limit && <p className="mt-0.5 text-body-sm text-alert">{errors.limit}</p>}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${label}`}
            className="grid w-8 shrink-0 place-items-center self-start rounded-base py-2 text-ghost hover:bg-lift hover:text-alert"
          >
            <TrashIcon className="size-4" />
          </button>
        </div>
      </div>
    </li>
  );
}
