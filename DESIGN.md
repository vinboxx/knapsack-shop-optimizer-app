---
name: Tactical Arcanum
colors:
  surface: "#0f131c"
  surface-dim: "#0f131c"
  surface-bright: "#353942"
  surface-container-lowest: "#0a0e16"
  surface-container-low: "#181c24"
  surface-container: "#1c2028"
  surface-container-high: "#262a33"
  surface-container-highest: "#31353e"
  on-surface: "#dfe2ee"
  on-surface-variant: "#d8c3ad"
  inverse-surface: "#dfe2ee"
  inverse-on-surface: "#2c3039"
  outline: "#a08e7a"
  outline-variant: "#534434"
  surface-tint: "#ffb95f"
  primary: "#ffc174"
  on-primary: "#472a00"
  primary-container: "#f59e0b"
  on-primary-container: "#613b00"
  inverse-primary: "#855300"
  secondary: "#4edea3"
  on-secondary: "#003824"
  secondary-container: "#00a572"
  on-secondary-container: "#00311f"
  tertiary: "#c7c8ff"
  on-tertiary: "#1000a9"
  tertiary-container: "#a7a9ff"
  on-tertiary-container: "#2b29bb"
  error: "#ffb4ab"
  on-error: "#690005"
  error-container: "#93000a"
  on-error-container: "#ffdad6"
  primary-fixed: "#ffddb8"
  primary-fixed-dim: "#ffb95f"
  on-primary-fixed: "#2a1700"
  on-primary-fixed-variant: "#653e00"
  secondary-fixed: "#6ffbbe"
  secondary-fixed-dim: "#4edea3"
  on-secondary-fixed: "#002113"
  on-secondary-fixed-variant: "#005236"
  tertiary-fixed: "#e1e0ff"
  tertiary-fixed-dim: "#c0c1ff"
  on-tertiary-fixed: "#07006c"
  on-tertiary-fixed-variant: "#2f2ebe"
  background: "#0f131c"
  on-background: "#dfe2ee"
  surface-variant: "#31353e"
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: "700"
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: "700"
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: "600"
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: "600"
    lineHeight: 28px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: "600"
    lineHeight: 24px
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: "400"
    lineHeight: 16px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: "500"
    lineHeight: 18px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: "500"
    lineHeight: 14px
    letterSpacing: 0.06em
  code-num:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: "600"
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system projects a high-tech tactical HUD merged with the precision of an arcane RPG ledger. Tailored for theorycrafters, min-maxers, and inventory tacticians, it balances utilitarian analytical density with the visceral satisfaction of game UI hardware. The experience evokes control, mathematical clarity, and the euphoric triumph of a perfectly balanced ledger (zero-remainder optimization).

The aesthetic unites high-tech tactical minimalism with subtle glassmorphic telemetry. Interfaces feel like advanced military-grade logistical terminals built for fantasy economies: sharp data visualization, micro-glow states, calibrated wireframe borders, and dense yet breathable modular pods.

## Colors

The palette establishes an ultra-deep charcoal navy substrate layered with luminescent data accents:

- **Surface Neutral (`#0B0F17`)**: Base void. Elevated surfaces step up into `#111827` (Base Pod) and `#1E293B` (Interactive Layer) with subtle cool undertones.
- **Primary / Auric Amber (`#F59E0B` / `#FBBF24`)**: Represents gold, transactions, coin limits, and active budget states.
- **Secondary / Solved Emerald (`#10B981` / `#34D399`)**: Signifies optimal calculation, zero-remainder solutions, capacity targets, and mathematical equilibrium.
- **Tertiary / Arcane Indigo & Cyan (`#6366F1` & `#06B6D4`)**: Identifies item tiers, dynamic weight rankings, rarity classifications, and filtering parameters.
- **Critical / Overload Crimson (`#EF4444`)**: Designates capacity overflow, budget deficits, and missing requirement alerts.
- **Text & Telemetry**: Text flows from high-visibility Frost (`#F8FAFC`) to muted Tactical Slate (`#94A3B8`) and Ghost Navy (`#475569`).

## Typography

Typography delivers immediate operational hierarchy:

- **Display & Section Titles (Space Grotesk)**: Geometric, tech-industrial, and structural. Used for screen titling, primary tier readouts, and aggregate capacity heads.
- **Operational Interface & Narrative (Geist)**: High-density sans-serif optimized for tight layouts, tooltips, configuration rows, and item descriptions.
- **Data, Balances & Metrics (JetBrains Mono)**: Fixed-pitch precision for gold tallies, weight constraints, item quantities, and optimization algorithm statuses. All currency tallies and percentage metrics must be rendered in tabular monospace to avoid layout jitter during real-time recalculations.

## Layout & Spacing

The layout is built upon an 8pt architectural rhythm tailored to high-density utility apps:

- **Grid Architecture**: 12-column adaptive grid on desktop (max width 1440px) dividing into a 3-column operational layout (Inventory Repository, Solver Parameters, Optimized Knapsack Output). Tablet scales to an 8-column layout with collapsable inventory drawers. Mobile condenses to a 4-column single-stream telemetry stack.
- **Rhythm & Flow**: Internal component padding maintains strict 4px/8px increments (`space-xs` to `space-md`), preserving maximum vertical canvas for item list visibility. Section boundaries use `space-lg` to create visual discipline between variable inputs and analytical outputs.

## Elevation & Depth

Visual hierarchy uses crisp tactical paneling with targeted luminous blurs rather than muddy diffuse shadows:

- **Layer 0 (Canvas Void)**: `#0B0F17` background with faint tactical dot-grid or millimeter rule accents.
- **Layer 1 (Modular Shells)**: `#111827` at 85% opacity with 12px backdrop-blur and a 1px structural stroke of `#1E293B`.
- **Layer 2 (Interactive Items & Chips)**: `#1E293B` surfaces with hairline outer borders of `#334155`.
- **Layer 3 (Active Focus & Optimization Overlays)**: Surface lifts slightly via `#243247` highlighted by directional 1px perimeter glow (`#F59E0B` for currency focus, `#10B981` for solved states).
- **HUD Glow Effects**: Ambient glows are reserved strictly for system states: an emerald edge-luminescence (`0 0 16px rgba(16, 185, 129, 0.25)`) signals exact zero-remainder knapsack fulfillment.

## Shapes

The interface features precise, angular, and refined micro-radii (`0.25rem` standard). This soft-cornered technical cut communicates military-grade software aesthetics without harsh un-styled corners. Structural brackets, segmented progress meters, and item socket icons embrace 45-degree chamfers and razor-fine framing to reflect high-tech gaming HUD conventions.

## Components

### Action Controls & Buttons

- **Primary Execution (Solve / Optimize)**: Solid amber `#F59E0B` fill with jet black `#0B0F17` JetBrains Mono bold text. Border contains a 1px subtle `#FDE68A` top-light. On hover, produces an auric outer bloom.
- **Tactical Secondary**: Charcoal slate `#1E293B` fill, 1px `#334155` border, cool white `#F8FAFC` label.
- **Success State Trigger**: Solid `#10B981` with inner pulse animation confirming optimal budget usage.

### Input Fields & Parameter Controls

- **Budget / Weight Steppers**: Darkened recess `#0B0F17` with hairline border `#334155`. Displays active numeric values in JetBrains Mono. Incremental up/down micro-steppers flank the input with crisp divider rules.
- **Currency Inset**: Left-adorned with an invariant gold coin glyph; active input transitions border color to `#F59E0B`.

### Item Inventory Cards & Pods

- **Catalog Cards**: Modular pods framed with 1px `#1E293B`. Includes item icon frame, name in Geist, weight/cost data points in JetBrains Mono, and an integrated priority toggle.
- **Rarity / Tier Brackets**: Denoted by vertical 2px left-border accents (Common: `#94A3B8`, Rare: `#06B6D4`, Epic: `#6366F1`, Legendary: `#F59E0B`).

### Status Badges & Optimization Metrics

- **Zero-Remainder Badge**: Pill badge with `#064E3B` background, `#34D399` text, and `#10B981` border with a live indicator dot.
- **Weight / Cost Progress Meter**: Segmented multi-track horizontal bar showing capacity consumption. Overflows trigger instantaneous transition to Crimson (`#EF4444`).

### Knapsack Solved Grid

- **Result Output Matrix**: Highlighted container grouping selected items into clean, dense ledger rows, with totals, unused gold delta, and total stat yield anchored to a sticky footer summary panel.
