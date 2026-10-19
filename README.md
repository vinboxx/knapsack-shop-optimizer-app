# Knapsack Shop Optimizer

Plan in-game shop purchases that spend every coin you can, buying your most wanted items first.

**Live app:** https://vinboxx.github.io/knapsack-shop-optimizer-app/

## What it does

You enter a coin budget and up to 12 items, each with a cost per unit and an optional purchase limit. Drag the items into priority order and press **Calculate Strategy**. The app finds the plan that:

1. leaves the fewest unused coins (ideally 0), then
2. buys as many units as possible of priority 1, then priority 2, and so on.

For example, with 1,555 coins and items costing 18, 13 (limit 1,175) and 14, it buys 82 × 18 + 5 × 13 + 1 × 14 = 1,555, so no coins are left over.

### Priority-first alternative

Spending every coin can mean buying fewer of a higher priority. When it does, a second card, **Alternative · priority first**, shows the plan that buys as many of priority 1 as fit, then priority 2, and so on, even if coins are left over. It lists the items that change and how many coins that plan leaves.

For example, with 1,555 coins and items costing 30, 13 and 17, the main plan is 49 / 0 / 5 with 0 left. The alternative is 51 / 1 / 0 with 12 left. If both plans buy the same, the card isn't shown.

### Linked items (equal priority)

Tap the 🔗 button between two rows to give them the same priority. A group of linked rows is a **tier**. The solver decides how many units the whole tier gets, then splits them as evenly as possible by units. Any extra units go to the higher rows, so 83 units over two items becomes 42 / 41. An item that reaches its purchase limit drops out of the split, and the rest of the tier shares what's left.

Adding an item, or editing its cost, links it to the row above when both cost the same. Auto-link never re-links a pair you unlinked by hand, and it never runs after a drag.

### Other details

- Works on phones and desktop. Drag from the handle (long-press on touch), or use the keyboard: focus a handle, press Space, use the arrow keys, then press Space again.
- Preset items fill in a name and cost, and you can edit both.
- Your budget, items, order and links are saved in the browser (`localStorage`).
- Everything runs in your browser; there's no backend. The solver runs in a Web Worker and handles budgets up to 1,000,000 coins.

## Development

This project uses [Vite+](https://viteplus.dev/guide/) (the `vp` CLI), which bundles Vite, Vitest, Oxlint and Oxfmt. It also uses React 19 with strict TypeScript, Tailwind CSS v4 and dnd-kit.

| Task                       | Command                                   |
| -------------------------- | ----------------------------------------- |
| Install dependencies       | `vp install`                              |
| Dev server                 | `vp dev`                                  |
| Format + lint + type check | `vp check` (`vp check --fix` to auto-fix) |
| Unit tests                 | `vp test`                                 |
| Production build           | `vp build`                                |
| Preview the build          | `vp preview`                              |

Requires Node.js 24. The app is served under `/knapsack-shop-optimizer-app/` (see `base` in `vite.config.ts`).

### Project layout

```
src/
  solver/       Pure TypeScript optimisation engine (no UI code)
    tier.ts       Split rule and per-tier cost segments
    solve.ts      Exact-remainder DP, priority traceback, priority-first plan
    client.ts     Promise wrapper that runs the solver in a Web Worker
  state/
    inventory.ts  Reducer: items, ordering, link and auto-link rules, validation
    persist.ts    localStorage load/save
  components/   React UI (priority list, item rows, budget input, results)
  data/presets.ts  Preset items
docs/spec.md    Product specification
DESIGN.md       Visual design system ("Tactical Arcanum")
```

### How the solver works

Each tier behaves like a single item: for any total quantity, the split rule fixes exactly how the units are shared and what they cost. `solve.ts` builds a table of every exact spend reachable from each tier downwards, taking O(budget) time per tier segment. It then picks the largest reachable spend (the smallest remainder) and walks the tiers from the top, giving each one the most units that still allow that spend. The priority-first alternative is a single greedy pass: each tier, from the top, takes the most units that fit the coins left. Unit tests in `src/solver/solve.test.ts` cover the spec's use cases and check the solver against a brute-force search on random inputs.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`. It runs `vp check`, `vp test` and `vp build`, then publishes `dist/` to GitHub Pages. A failing step stops the deploy. In the repository settings, the Pages source must be set to **GitHub Actions**.
