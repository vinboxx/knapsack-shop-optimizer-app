**Knapsack Shop Optimizer App**
-------------------------------

1\. Executive Summary
---------------------

The **Knapsack Shop Optimizer** is a lightweight tool designed to help game players and shoppers maximize their purchasing value when dealing with limited budgets (in-game currency/coins) and structured item priorities. It solves the bounded/unbounded knapsack problem based on user-defined priority levels, costs, and availability constraints.

2\. Core Functional Requirements
--------------------------------

### 2.1 Item Management

- **Item Capacity:** The system shall support adding a maximum of **12 items** per calculation session.

- **Item Properties:** Each item entry must contain the following properties:

  - **Item Name:** Text string representing the item (e.g., "Skill Scroll", "Ore").

  - **Cost per Unit (Price):** Required positive integer representing the coin cost per single unit.

  - **Purchase Limit (Optional):** Optional positive integer representing the maximum inventory/remaining quantity available for purchase (e.g., 800 items remaining). If left empty, the item is treated as having no limit (unbounded).

- **Predefined Items:**

  - The system shall provide a pre-populated list of common/preset items for quick selection.

  - Selecting a predefined item will automatically populate its default name and cost.

  - Users can edit or customize pre-populated fields after selection.

### 2.2 Priority Ordering

- **Drag-and-Drop Sorting:**

  - Users can reorder items in the list using a drag-and-drop interface.

  - The vertical order of items directly determines their solver priority (Item at **Position 1** = Highest Priority; Item at **Position 12** = Lowest Priority).

- **Priority Rule Behavior:**

  - The optimization solver shall attempt to maximize the quantity of higher-priority items first before attempting to allocate budget to lower-priority items.

### 2.3 Equal-Priority Tiers (Linked Items)

Neighbouring items can be **linked** to share the same priority. A group of linked items is a **tier**. An unlinked item is a tier of one.

- **Link Button:**

  - A small link button (🔗) sits in the gap between every two neighbouring rows.

  - Tapping it links the two rows into one tier; tapping it again unlinks them. Any neighbouring items can be linked, whatever their prices.

  - A tier is always a contiguous run of rows.

- **Auto-Link:**

  - When an item is added, or its cost is edited, and its cost equals the cost of the row directly above it, the two rows are linked automatically.

  - Auto-link never re-links a pair the user unlinked by hand, and it never runs after a drag.

- **Priority Numbers:** Priority numbers count tiers, not rows. All rows in a tier show the same number (e.g. `1, 1, 2, 3`).

- **Dragging and Tiers:**

  - Dragging a row out of a tier removes it from that tier.

  - Dropping a row between two linked rows adds it to that tier.

- **Split Rule (Equal Units):**

  - The solver decides the total quantity for a tier, then splits it across the tier's items **as evenly as possible by units**, handing out units round-robin from the top row down.

  - If the total doesn't divide evenly, the extra units go to the higher rows first (e.g. 83 units over two items → 42 / 41).

  - An item that reaches its Purchase Limit drops out of the split, and the remaining items in the tier share the rest.

### 2.4 Budget & Constraints

- **Coin Budget:**

  - A required input field where the user enters their total available currency/coins (e.g., 1,555 coins).

  - Must accept positive integers only.

### 2.5 Optimization & Calculation Engine

- **Exact Budget Matching (Zero Remainder Option):**

  - The algorithm must prioritize finding combinations that leave **0 unused coins** (exact balance clearance).

  - If no combination leaves 0 remainder while respecting priority, the system shall find the combination that minimizes leftover coins while respecting the strict priority hierarchy.

- **Priority-Based Knapsack Logic:**

  1.  Maximize the quantity of Item $N$ (highest priority).

  2.  If exact budget alignment or item purchase limits require adjusting Item $N$'s count slightly, use lower-priority items ($N+1$, $N+2$, etc.) to absorb remainder coins cleanly.

- **Tiers in the Solver:**

  - The solver works on tiers (section 2.3), not on single rows. For any total quantity $T$, the Split Rule gives exactly one allocation, so a tier behaves like a single item whose cost for $T$ units is fixed.

  - Among all plans with the smallest possible remainder, the solver picks the one with the highest Tier 1 quantity, then the highest Tier 2 quantity, and so on.

### 2.6 Output & Results Display

- **Purchasing Plan Breakdown:**

  - Displays the calculated optimal quantity to buy for each item.

  - Displays total cost incurred per item category.

- **Summary Metrics:**

  - **Total Spent:** Total coins consumed by the calculated plan.

  - **Remaining Balance:** Leftover coins (ideally 0).

  - **Total Items Purchased:** Sum of all units across all bought items.

- **Priority-First Alternative:**

  - The solver also computes a **priority-first** plan that ignores the remainder: the most Tier 1 units that fit the budget, then the most Tier 2 units that fit the coins left, and so on.

  - When that plan buys different quantities from the main plan, the output shows it in a separate "Alternative · priority first" card below the main plan. The card lists only the items whose quantity changes (new quantity and difference from the main plan), the coins it leaves unspent, its total spent and its total units.

  - When both plans buy the same quantities, no alternative card is shown.

  - Example: budget `1555`, items costing 30, 13 and 17. The main plan is 49× / 0× / 5× (remainder 0). The alternative is 51× / 1× / 0× (remainder 12).

3\. User Experience (UX) Requirements
-------------------------------------

- **Simplicity & Speed:** Minimal clicks required from inputting budget to seeing calculated results.

- **Real-time Feedback:** Clear visually disabled states when 12 items are reached or when budget inputs are invalid.

- **Reorder Visual Cues:** Intuitive drag handles or hover states indicating items can be reordered.

- **Tier Visual Cues:** Linked rows are joined by a bracket on the left and share one priority number. The link button shows clearly whether it is linked or unlinked, and is large enough to tap on a phone.

4\. Key Use Case Walkthrough
----------------------------

1.  **Input Budget:** User inputs `1555` into the **Total Coins** field.

2.  **Add Items:**

    - User selects 18-coin item from predefined list or manually creates it.

    - User adds 13-coin item and sets remaining limit to `1175`.

    - User adds 14-coin item as fallback.

3.  **Set Priority:** User drags the 18-coin item to the top slot (Priority 1), followed by the 13-coin item (Priority 2), and 14-coin item (Priority 3).

4.  **Calculate:** User presses "Calculate Strategy".

5.  **View Results:** App displays exact purchase plan:

    - **82×** 18-Coin Item (1,476 coins)

    - **5×** 13-Coin Item (65 coins)

    - **1×** 14-Coin Item (14 coins)

    - **Total Spent:** 1,555 coins | **Remainder:** 0 coins.

### 4.1 Use Case: Items With the Same Price

1.  **Input Budget:** `1555` coins.

2.  **Add Items (in this order):**

    - Charm Guide (18 coins)

    - Charm Design (18 coins). It has the same cost as the row above, so it is **auto-linked** to Charm Guide.

    - Artisan's Vision (13 coins, limit `1175`)

    - True Gold (14 coins)

3.  **Resulting Priorities:** `1` Charm Guide, `1` Charm Design, `2` Artisan's Vision, `3` True Gold.

4.  **View Results:**

    - **41×** Charm Guide (738 coins)

    - **41×** Charm Design (738 coins)

    - **5×** Artisan's Vision (65 coins)

    - **1×** True Gold (14 coins)

    - **Total Spent:** 1,555 coins | **Remainder:** 0 coins.

5.  **If Unlinked:** If the user taps 🔗 to unlink Charm Guide and Charm Design, priorities become `1, 2, 3, 4` and the plan becomes 82× / 0× / 5× / 1×.

5\. Technical Stack & Deployment
--------------------------------

### 5.1 Stack

- **Toolchain:** [Vite+](https://viteplus.dev/guide/) (`vite-plus` package, `vp` CLI). It bundles Vite, Rolldown, Vitest, Oxlint and Oxfmt, so no separate setup for those tools is needed.

- **UI Framework:** React with **TypeScript** (strict mode).

- **Styling:** Tailwind CSS v4, added with the `@tailwindcss/vite` plugin.

- **Drag-and-Drop:** `@dnd-kit/core` + `@dnd-kit/sortable`. The library must work on both phone and desktop:

  - Pointer/mouse dragging on desktop.

  - Touch dragging on phones, with a short press delay (or a dedicated drag handle) so scrolling the list still works.

  - Keyboard reordering for accessibility.

- **Runtime:** Fully client-side static app. No backend; the solver runs in the browser.

- **Responsive Layout:** Mobile-first layout that works from phone width (~360px) up to desktop.

### 5.2 Project Commands

| Task                       | Command      |
| -------------------------- | ------------ |
| Install dependencies       | `vp install` |
| Dev server                 | `vp dev`     |
| Format + lint + type check | `vp check`   |
| Unit tests (Vitest)        | `vp test`    |
| Production build           | `vp build`   |
| Preview build locally      | `vp preview` |

### 5.3 Testing

- The optimization engine (section 2.5) shall be a pure TypeScript module, separate from the UI, with Vitest unit tests.

- Tests must cover at least the use case in section 4 (budget `1555` → 82× / 5× / 1×, remainder 0), the tier use case in section 4.1 (→ 41× / 41× / 5× / 1×, remainder 0), an uneven tier split (extra unit goes to the higher row), a tier item hitting its purchase limit, unbounded items, and the "no exact match" (minimal remainder) case.

- The auto-link rules (section 2.3) shall have unit tests: linking on add, linking on cost edit, no re-linking after a manual unlink, and no auto-link after a drag.

### 5.4 Deployment (GitHub Pages)

- **Hosting:** GitHub Pages for the repository `vinboxx/knapsack-shop-optimizer-app`, served at `https://vinboxx.github.io/knapsack-shop-optimizer-app/`.

- **Base Path:** The Vite config shall set `base: '/knapsack-shop-optimizer-app/'` so assets load correctly under the repository sub-path.

- **Trigger:** A GitHub Actions workflow (`.github/workflows/deploy.yml`) runs on every push to the `main` branch (plus manual `workflow_dispatch`).

- **Pages Source:** Repository Settings → Pages → Source set to **GitHub Actions**. Build output is not committed to the repository.

- **Workflow Steps:**

  1.  `actions/checkout`

  2.  `voidzero-dev/setup-vp` pinned to an exact release tag (not the floating `v1` tag), with `node-version: '24'` and `cache: true`. This also runs `vp install`.

  3.  `vp check`, then `vp test`, then `vp build`. A failing step stops the deploy.

  4.  `actions/upload-pages-artifact` with `path: dist`

  5.  `actions/deploy-pages` in a `deploy` job using the `github-pages` environment.

- **Permissions:** `contents: read`, `pages: write`, `id-token: write`. Use a `concurrency` group (`pages`) so only one deploy runs at a time.
