import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type Announcements,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { priorityNumbers, type Action, type Item, type ItemErrors } from "../state/inventory.ts";
import { ItemRow } from "./ItemRow.tsx";

interface PriorityListProps {
  items: Item[];
  errors: Record<string, ItemErrors>;
  focusId: string | null;
  dispatch: (action: Action) => void;
}

function bracketFor(items: Item[], index: number): "top" | "middle" | "bottom" | null {
  const linkedAbove = index > 0 && items[index]!.linkedToPrev;
  const linkedBelow = items[index + 1]?.linkedToPrev ?? false;
  if (linkedAbove && linkedBelow) return "middle";
  if (linkedAbove) return "bottom";
  if (linkedBelow) return "top";
  return null;
}

export function PriorityList({ items, errors, focusId, dispatch }: PriorityListProps) {
  const [dragging, setDragging] = useState(false);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    // A short press on the handle starts a drag; a quick swipe still scrolls.
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const priorities = priorityNumbers(items);

  const nameOf = (id: UniqueIdentifier) =>
    items.find((item) => item.id === id)?.name.trim() || "Untitled item";
  const positionOf = (id: UniqueIdentifier) => items.findIndex((item) => item.id === id) + 1;
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${nameOf(active.id)}, row ${positionOf(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over ? `${nameOf(active.id)} moved to row ${positionOf(over.id)}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over ? `${nameOf(active.id)} dropped at row ${positionOf(over.id)}.` : undefined,
    onDragCancel: ({ active }) => `Reorder cancelled. ${nameOf(active.id)} stayed in place.`,
  };

  if (items.length === 0) {
    return (
      <div className="grid place-items-center rounded-base border border-dashed border-hairline px-4 py-8 text-center">
        <p className="text-body-md text-tactical">No items yet.</p>
        <p className="mt-1 text-body-sm text-ghost">
          Add items, then drag them into priority order.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      accessibility={{ announcements }}
      onDragStart={() => setDragging(true)}
      onDragCancel={() => setDragging(false)}
      onDragEnd={({ active, over }) => {
        setDragging(false);
        if (!over || active.id === over.id) return;
        dispatch({
          type: "moveItem",
          from: positionOf(active.id) - 1,
          to: positionOf(over.id) - 1,
        });
      }}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <ol aria-label="Items in priority order">
          {items.map((item, index) => (
            <ItemRow
              key={item.id}
              item={item}
              above={items[index - 1]}
              priority={priorities[index]!}
              bracket={bracketFor(items, index)}
              errors={errors[item.id]}
              autoFocus={item.id === focusId}
              listDragging={dragging}
              onChange={(patch) => dispatch({ type: "updateItem", id: item.id, patch })}
              onRemove={() => dispatch({ type: "removeItem", id: item.id })}
              onToggleLink={() => dispatch({ type: "toggleLink", id: item.id })}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}
