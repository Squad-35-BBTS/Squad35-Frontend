---
name: SGA-LB Functional Wireframe System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#1d4ed8'
  on-secondary: '#ffffff'
  secondary-container: '#4069f2'
  on-secondary-container: '#fffbff'
  tertiary: '#46566c'
  on-tertiary: '#ffffff'
  tertiary-container: '#5e6e85'
  on-tertiary-container: '#e9f0ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dce1ff'
  secondary-fixed-dim: '#b7c4ff'
  on-secondary-fixed: '#001551'
  on-secondary-fixed-variant: '#0039b5'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  typescale.title.large:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  typescale.title.base:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  typescale.title.small:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: 0em
  typescale.paragraph.base:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  typescale.paragraph.small:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  typescale.button.base:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  typescale.label.small:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 4px
  space-sm: 8px
  space-md: 16px
  space-lg: 24px
  space-xl: 32px
---

## Brand & Style

The design system establishes a structural, high-utility wireframe language tailored for enterprise fiscal and project compliance workflows (Sistema de Gestão de Apuração da Lei do Bem). It prioritizes functional clarity, information architecture, and cognitive ergonomics over superficial decoration.

The visual style blends **Modern Corporate** reliability with a disciplined **Low-Fidelity Functional Grayscale** aesthetic. By neutralizing non-essential decorative styling and relying on precision typographic scale, semantic borders, and structural surface containment, the interface enables compliance officers, auditors, and project managers to process data-dense tax-incentive filings without distraction. Accent color is applied surgically—exclusively for primary user pathways, system focus, and state indication.

## Colors

The palette operates on a strict functional hierarchy optimized for structural wireframing and high data legibility:

- **Canvas & Surfaces:**
  - `background.default`: `#f8fafc` (Slate 50) for overall canvas background; alternates with `#f1f5f9` (Slate 100) for structured section segregation.
  - `container.default`: `#ffffff` for elevated data panels, tables, form groups, and dialog containers.
- **Borders & Dividers:**
  - `border.default`: `#cbd5e1` (Slate 300) for field boundaries, input perimeters, and active structural splits.
  - `border.subtle`: `#e2e8f0` (Slate 200) for table row dividers, inactive containers, and internal card segmentation.
- **Typography & Iconography:**
  - `text.default`: `#0f172a` (Slate 900) for maximum-contrast headlines, critical cell metrics, and active labels.
  - `text.muted`: `#64748b` (Slate 500) for instructional helper strings, metadata timestamps, column headers, and structural hints.
- **Semantic Accents & Interactive:**
  - `primary.accent`: `#2563eb` (Blue 600) for focal actions, active breadcrumb trails, and selection indicators.
  - `primary.accent-hover`: `#1d4ed8` (Blue 700) for sustained pointer engagement and focused interactive wireframe triggers.

## Typography

The design system exclusively adopts **Inter** to ensure maximum metric clarity, tabular digit alignment, and structural neutrality across dense data grids.

- **Title Large (`typescale.title.large` / 24px Bold):** Reserved for module headers, main fiscal year review titles, and dashboard overview page headings.
- **Title Base (`typescale.title.base` / 18px Semi-Bold):** Used for panel containers, secondary dashboard cards, and major modal dialogues.
- **Title Small (`typescale.title.small` / 15px Semi-Bold):** Applied to table group headings, collapsible fiscal section panels, and form legend titles.
- **Paragraph Base (`typescale.paragraph.base` / 14px Regular):** The default workhorse text for form inputs, table data values, descriptive narrative, and status readouts.
- **Paragraph Small (`typescale.paragraph.small` / 12px Regular):** Form helper microcopy, tooltip descriptions, validation error strings, and subtext notes.
- **Button Base (`typescale.button.base` / 13px Medium):** Action controls, pagination trigger buttons, and toolbar interaction targets.
- **Label Small (`typescale.label.small` / 11px Medium Uppercase):** Column headers, metric metadata tags, category indicators, and status pill tags. Rendered in uppercase with wider tracking (`0.05em`).

## Layout & Spacing

The interface follows a fluid, modular grid model designed for data-intensive enterprise desktop screens, scaling down systematically:

- **Desktop Layout (≥ 1280px):** 12-column grid with a fixed collapsible sidebar (`240px` expanded, `64px` icon-only), `24px` margins (`spacing.lg`), and `16px` gutters (`spacing.md`). Main containers use `spacing.lg` padding; tables and field grids leverage `spacing.md`.
- **Tablet / Compact Layout (768px – 1279px):** 8-column layout with `16px` margins and gutters. Sidebar transforms into a persistent overlay drawer.
- **Mobile / Narrow Layout (< 768px):** 4-column layout, stacking complex multi-field calculations vertically with `spacing.sm` item gaps and `16px` canvas margins.

### Spacing Tokens Application:
- `spacing.xs` (4px): Inline icon-to-label separation, badge padding, internal input icon inset.
- `spacing.sm` (8px): Form input inner vertical padding, tight stack gap between label and input, table cell compact spacing.
- `spacing.md` (16px): Standard container padding, form horizontal field gap, table default cell padding, toolbar spacing.
- `spacing.lg` (24px): Card module padding, major section gaps, dashboard KPI tile spacing.
- `spacing.xl` (32px): Main screen header separation, large fiscal report section delineations.

## Elevation & Depth

To sustain low-fidelity wireframe rigor and avoid premature visual commitment, this system eschews dramatic dropshadows and blurred glass layers in favor of **Tonal Layering** and **Crisp Structural Outlines**:

- **Level 0 (Base Canvas):** `#f8fafc` background with zero elevation.
- **Level 1 (Structural Panels & Cards):** `#ffffff` surface, bounded by a 1px solid `border.subtle` (`#e2e8f0`). No drop shadow; separation is achieved strictly by tonal contrast against the `#f8fafc` base.
- **Level 2 (Interactive Floating Surfaces - Menus, Popovers, Tooltips):** `#ffffff` surface with a 1px solid `border.default` (`#cbd5e1`) and a functional, utilitarian shadow (`0px 4px 6px -1px rgba(15, 23, 42, 0.08), 0px 2px 4px -2px rgba(15, 23, 42, 0.04)`).
- **Level 3 (Modal Dialogs & Overlays):** `#ffffff` surface surrounded by `border.default` and accompanied by a semi-opaque backdrop scrim (`rgba(15, 23, 42, 0.4)`).

## Shapes

The design system enforces a restrained geometric profile with subtle corner radials to preserve architectural order:

- **`border-radius.sm` (4px):** Applied to micro-components, inline code chips, compact action buttons, table status badges, and input elements.
- **`border-radius.md` (8px):** The default radius for standard cards, data table wrappers, modal containers, and dropdown flyouts.
- **`border-radius.lg` (12px):** Reserved for high-level module wrappers, multi-step calculation wizards, and file upload dropzones.

## Components

### Buttons
- **Primary:** Filled `#2563eb` with `#ffffff` text (`typescale.button.base`). 8px vertical, 16px horizontal padding. Border radius `border-radius.sm`. Hover shifts to `#1d4ed8`.
- **Secondary / Wireframe Outline:** `#ffffff` surface with 1px `border.default` (`#cbd5e1`), `#0f172a` text. Hover shifts background to `#f1f5f9`.
- **Tertiary / Ghost:** Transparent background, `#64748b` text. Hover reveals `#f1f5f9` surface and `#0f172a` text.

### Form Inputs & Fields
- **Container:** Height of 36px, `border-radius.sm`, bordered with 1px solid `border.default` (`#cbd5e1`) against a `#ffffff` background.
- **Typography:** Placeholder text rendered in `text.muted` (`#64748b`) with `typescale.paragraph.base`. Value text rendered in `text.default`.
- **Label:** Stacked vertically above the input with a `spacing.xs` gap; styled with `typescale.paragraph.small` or `typescale.label.small` in `text.default`.
- **Focus State:** 1px `primary.accent` border with a 2px outer outline ring of `#2563eb` at 20% opacity.

### Data Tables (Lei do Bem Project Ledger)
- **Header:** Background `#f1f5f9`, border bottom 1px `border.default`. Text styled using `typescale.label.small` in `text.muted`.
- **Rows:** Alternating or plain `#ffffff` rows with 1px `border.subtle` (`#e2e8f0`) bottom divider. Height 44px (compact 36px). Cell padding is `spacing.sm` vertical, `spacing.md` horizontal.
- **Cell Data:** Numeric fiscal data right-aligned using tabular figures with `typescale.paragraph.base`.

### Cards & Metrics (KPI Panels)
- **Container:** `#ffffff` surface, 1px `border.subtle` perimeter, `border-radius.md`. Inner padding `spacing.md` or `spacing.lg`.
- **Header:** Displays KPI title in `typescale.label.small` (`text.muted`) followed by value in `typescale.title.large` (`text.default`).

### Badges & Status Indicators
- **Layout:** Inline-flex, horizontal padding `6px`, vertical `2px`, `border-radius.sm`.
- **Aesthetic:** Neutral wireframe styling using a light slate fill (`#f1f5f9`), 1px `border.subtle` border, and `typescale.label.small` in `text.muted` or `text.default`.

### Checkboxes & Radios
- **Box/Radio:** 16px x 16px, `#ffffff` surface, 1px solid `border.default`. Checked state fills with `primary.accent` and white check icon. Focus ring applies a 2px light blue halo.