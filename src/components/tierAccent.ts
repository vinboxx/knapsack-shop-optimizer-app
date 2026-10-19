/** Priority colours borrowed from the rarity brackets: Legendary, Epic, Rare, then Common. */
const ACCENTS = [
  { bar: "bg-gold", border: "border-l-gold", text: "text-gold" },
  { bar: "bg-arcane", border: "border-l-arcane", text: "text-arcane" },
  { bar: "bg-rune", border: "border-l-rune", text: "text-rune" },
  { bar: "bg-tactical", border: "border-l-tactical", text: "text-tactical" },
] as const;

export function tierAccent(priority: number) {
  return ACCENTS[Math.min(priority, ACCENTS.length) - 1]!;
}
