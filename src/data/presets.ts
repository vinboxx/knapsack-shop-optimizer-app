export interface Preset {
  name: string;
  cost: number;
}

/** Quick-add items. Name and cost can be edited after adding. */
export const PRESETS: readonly Preset[] = [
  { name: "Charm Guide", cost: 18 },
  { name: "Charm Design", cost: 18 },
  { name: "Artisan's Vision", cost: 13 },
  { name: "True Gold", cost: 14 },
  // Placeholder costs; adjust to your shop's prices.
  { name: "Skill Scroll", cost: 20 },
  { name: "Ore", cost: 5 },
];
