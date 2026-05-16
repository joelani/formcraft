# FormCraft — Coding Agent Prompt: Phase 7 (Design System + Responsive)

## Context

Phases 1–6 are complete and committed to `development`. The app is fully functional but:
- Colors are hardcoded throughout (raw hex values, arbitrary Tailwind colors like `blue-600`, `gray-500`, `indigo-600`)
- The Builder's 3-panel layout breaks on tablet and mobile
- The Analytics page has horizontal overflow on small screens
- The Dashboard modal and cards need mobile refinement
- No unified design system exists yet

You are implementing **Phase 7: Design System + Full Responsive**.

This phase touches every file. Read the full prompt before starting.

---

## Two Goals — In This Order

1. **Design system first** — Define all color, spacing, radius, and shadow tokens in `src/index.css` using Tailwind v4's `@theme {}` block. Then do a global find-and-replace of all hardcoded colors to use these tokens.
2. **Responsive second** — Fix every layout that breaks below 1024px. No horizontal overflow on any page at any viewport width (320px to 1440px).

---

## Part 1 — Design System (`src/index.css`)

Replace the current `src/index.css` with this full design system:

```css
@import "tailwindcss";

@theme {
  /* ─── Brand: Indigo/Violet ─── */
  --color-brand-50:  #eef2ff;
  --color-brand-100: #e0e7ff;
  --color-brand-200: #c7d2fe;
  --color-brand-300: #a5b4fc;
  --color-brand-400: #818cf8;
  --color-brand-500: #6366f1;
  --color-brand-600: #4f46e5;
  --color-brand-700: #4338ca;
  --color-brand-800: #3730a3;
  --color-brand-900: #312e81;

  /* ─── Neutrals ─── */
  --color-surface:        #ffffff;
  --color-surface-raised: #f8fafc;
  --color-surface-overlay:#f1f5f9;
  --color-border:         #e2e8f0;
  --color-border-strong:  #cbd5e1;

  /* ─── Text ─── */
  --color-text-primary:   #0f172a;
  --color-text-secondary: #475569;
  --color-text-muted:     #94a3b8;
  --color-text-disabled:  #cbd5e1;
  --color-text-inverse:   #ffffff;

  /* ─── Semantic ─── */
  --color-success:        #10b981;
  --color-success-light:  #d1fae5;
  --color-warning:        #f59e0b;
  --color-warning-light:  #fef3c7;
  --color-danger:         #ef4444;
  --color-danger-light:   #fee2e2;
  --color-info:           #3b82f6;
  --color-info-light:     #dbeafe;

  /* ─── Radius ─── */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px;

  /* ─── Shadow ─── */
  --shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  --shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05);
  --shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.05);

  /* ─── Typography ─── */
  --font-sans:  'Inter var', 'Inter', system-ui, sans-serif;
  --font-mono:  'JetBrains Mono', 'Fira Code', monospace;

  /* ─── Spacing ─── */
  --sidebar-width:         240px;
  --properties-width:      280px;
  --palette-width:         220px;
  --builder-header-height: 56px;
  --content-max-width:     1280px;
}

/* ─── Base styles ─── */
*, *::before, *::after {
  box-sizing: border-box;
}

html {
  -webkit-text-size-adjust: 100%;
}

body {
  font-family: var(--font-sans);
  color: var(--color-text-primary);
  background-color: var(--color-surface-raised);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* ─── Scrollbar styling ─── */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--color-border-strong);
  border-radius: var(--radius-full);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}

/* ─── Focus ring ─── */
:focus-visible {
  outline: 2px solid var(--color-brand-500);
  outline-offset: 2px;
}

/* ─── Animations ─── */
@keyframes toast-in {
  from { opacity: 0; transform: translateY(8px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-toast-in  { animation: toast-in  0.2s ease forwards; }
.animate-fade-in   { animation: fade-in   0.15s ease forwards; }
.animate-slide-up  { animation: slide-up  0.2s ease forwards; }
```

---

## Part 2 — Token Usage Reference

After defining tokens in `@theme`, Tailwind v4 generates utility classes from them automatically. Use these mappings:

| Old hardcoded class | New token-based class |
|---|---|
| `bg-white` | `bg-surface` |
| `bg-gray-50` | `bg-surface-raised` |
| `bg-gray-100` | `bg-surface-overlay` |
| `border-gray-200` | `border-border` |
| `border-gray-300` | `border-border-strong` |
| `text-gray-900` | `text-text-primary` |
| `text-gray-600` | `text-text-secondary` |
| `text-gray-400` | `text-text-muted` |
| `text-gray-300` | `text-text-disabled` |
| `bg-indigo-600` / `bg-blue-600` | `bg-brand-600` |
| `bg-indigo-50` / `bg-blue-50` | `bg-brand-50` |
| `text-indigo-600` / `text-blue-600` | `text-brand-600` |
| `ring-indigo-500` / `ring-blue-500` | `ring-brand-500` |
| `hover:bg-indigo-700` | `hover:bg-brand-700` |
| `text-green-600` | `text-success` |
| `bg-green-100` | `bg-success-light` |
| `text-red-500` | `text-danger` |
| `bg-red-100` | `bg-danger-light` |
| `text-amber-600` | `text-warning` |
| `text-blue-500` (info) | `text-info` |
| `rounded` | `rounded-[--radius-md]` or keep Tailwind defaults |
| `shadow-sm` | keep (Tailwind default maps fine) |

**Do a global find-and-replace across ALL `.jsx` files** for each mapping above. After replacing, do a final search for any remaining raw color classes (`blue-`, `indigo-`, `gray-`, `green-`, `red-`, `amber-`) and replace them with the correct token. The only acceptable raw colors left after this are chart fill colors inside `QuestionChart.jsx` (Recharts doesn't use Tailwind classes).

---

## Part 3 — UI Primitive Updates

Update each primitive to use token classes:

### `Button.jsx`

```jsx
const variants = {
  primary: 'bg-brand-600 text-text-inverse hover:bg-brand-700 focus-visible:ring-brand-500',
  secondary: 'bg-surface border border-border text-text-primary hover:bg-surface-overlay focus-visible:ring-brand-500',
  ghost: 'text-text-secondary hover:bg-surface-overlay focus-visible:ring-brand-500',
  danger: 'bg-danger text-text-inverse hover:bg-red-600 focus-visible:ring-danger',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-[--radius-md]',
  md: 'px-4 py-2 text-sm rounded-[--radius-md]',
  lg: 'px-5 py-2.5 text-base rounded-[--radius-lg]',
}

// Base classes always applied:
// 'inline-flex items-center justify-center gap-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed'
```

### `Input.jsx`

```jsx
// Input base:
// 'w-full border border-border rounded-[--radius-md] px-3 py-2 text-sm text-text-primary
//  bg-surface placeholder:text-text-muted
//  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
//  disabled:bg-surface-overlay disabled:text-text-muted
//  transition-colors'

// Error state adds: 'border-danger focus:ring-danger'
// Label: 'block text-sm font-medium text-text-primary mb-1'
// Error message: 'text-xs text-danger mt-1'
```

### `Badge.jsx`

```jsx
const variants = {
  draft:     'bg-surface-overlay text-text-secondary border border-border',
  published: 'bg-success-light text-success border border-success/20',
  default:   'bg-brand-50 text-brand-600 border border-brand-200',
}

// Base: 'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-[--radius-full]'
```

### `Modal.jsx`

```jsx
// Backdrop: 'fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in'
// Panel: 'bg-surface rounded-[--radius-xl] shadow-xl border border-border
//         w-full max-w-md mx-auto mt-24 p-6 relative animate-slide-up'
// Title: 'text-lg font-semibold text-text-primary'
// Close button: 'absolute top-4 right-4 text-text-muted hover:text-text-primary'
```

### `EmptyState.jsx`

```jsx
// Wrapper: 'flex flex-col items-center justify-center py-16 px-6 text-center'
// Icon wrapper: 'w-14 h-14 rounded-[--radius-xl] bg-brand-50 flex items-center justify-center mb-4'
// Icon: 'text-brand-400' size={24}
// Title: 'text-base font-semibold text-text-primary'
// Description: 'text-sm text-text-muted mt-1 max-w-xs'
// Action: 'mt-4'
```

### `Toast.jsx`

```jsx
// Toast item: 'animate-toast-in bg-surface border border-border rounded-[--radius-lg]
//              shadow-lg px-4 py-3 flex items-center gap-3 min-w-64 max-w-xs'
// Icons: success=text-success, error=text-danger, info=text-info
// Message: 'text-sm text-text-primary flex-1'
// Close: 'text-text-muted hover:text-text-secondary'
```

---

## Part 4 — Layout Components

### `AppShell.jsx`

```jsx
// Full viewport: 'h-screen flex overflow-hidden bg-surface-raised'
// Sidebar: fixed width from CSS variable
// Main: 'flex-1 flex flex-col overflow-hidden'
// Content area: 'flex-1 overflow-y-auto'
```

On mobile (`< lg`), the sidebar should be hidden by default and toggled via a hamburger button:

```jsx
const [sidebarOpen, setSidebarOpen] = useState(false)

// Mobile overlay sidebar:
// When open: slide in from left with a dark backdrop
// Backdrop click closes it

// AppShell layout:
<div className="h-screen flex overflow-hidden bg-surface-raised">
  {/* Mobile backdrop */}
  {sidebarOpen && (
    <div
      className="fixed inset-0 bg-black/40 z-20 lg:hidden"
      onClick={() => setSidebarOpen(false)}
    />
  )}

  {/* Sidebar */}
  <aside className={`
    fixed lg:static inset-y-0 left-0 z-30
    w-[--sidebar-width] bg-surface border-r border-border
    flex flex-col
    transform transition-transform duration-200
    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    lg:translate-x-0
  `}>
    <Sidebar onClose={() => setSidebarOpen(false)} />
  </aside>

  {/* Main content */}
  <main className="flex-1 flex flex-col overflow-hidden min-w-0">
    {/* Mobile header with hamburger */}
    <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-surface">
      <button onClick={() => setSidebarOpen(true)} className="text-text-secondary">
        <Menu size={20} />
      </button>
      <span className="font-semibold text-text-primary">FormCraft</span>
    </div>
    <div className="flex-1 overflow-y-auto">
      {children}
    </div>
  </main>
</div>
```

### `Sidebar.jsx`

```jsx
// Container: 'flex flex-col h-full'
// Logo area: 'flex items-center gap-2 px-4 py-4 border-b border-border'
// Logo text: 'font-bold text-text-primary text-lg'
// Nav area: 'flex-1 px-3 py-4 space-y-1'
// Nav link base: 'flex items-center gap-2.5 px-3 py-2 rounded-[--radius-md] text-sm font-medium transition-colors w-full'
// Nav link inactive: 'text-text-secondary hover:bg-surface-overlay hover:text-text-primary'
// Nav link active: 'bg-brand-50 text-brand-600'
// Footer: 'px-4 py-4 border-t border-border'
// Close button (mobile only): 'lg:hidden ...'
```

---

## Part 5 — Page-Level Responsive Fixes

### `Dashboard.jsx`

```jsx
// Page wrapper: 'p-4 sm:p-6 lg:p-8 max-w-[--content-max-width] mx-auto'
// Header: 'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6'
// Title: 'text-xl sm:text-2xl font-bold text-text-primary'
// Grid: 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'

// FormCard:
// - 'bg-surface rounded-[--radius-xl] border border-border shadow-sm
//    hover:shadow-md transition-shadow p-4 sm:p-5 flex flex-col gap-3'
// - Action row: 'flex items-center gap-2 flex-wrap mt-auto pt-3 border-t border-border'
// - On very small screens (< 360px), buttons stack: add 'min-w-0 flex-1' to builder/analytics buttons
```

### `Builder.jsx` — Most Critical

The 3-panel layout needs a completely different approach on mobile and tablet:

```
Desktop (≥ 1024px):   [Palette 220px] | [Canvas flex-1] | [Properties 280px]
Tablet  (768–1023px): [Canvas full] + bottom sheet for Palette / Properties
Mobile  (< 768px):    [Canvas full] + tab switcher for Palette / Properties
```

#### Implementation approach — Tab mode for mobile/tablet

```jsx
// Add state for mobile panel tab
const [mobilePanel, setMobilePanel] = useState('canvas') // 'palette' | 'canvas' | 'properties'

// Builder layout:
<div className="flex flex-col h-screen overflow-hidden">
  {/* Header bar */}
  <BuilderHeader ... />

  {/* Mobile tab bar — hidden on desktop */}
  <div className="flex lg:hidden border-b border-border bg-surface">
    {['palette', 'canvas', 'properties'].map(panel => (
      <button
        key={panel}
        onClick={() => setMobilePanel(panel)}
        className={`flex-1 py-2 text-xs font-medium capitalize transition-colors
          ${mobilePanel === panel
            ? 'text-brand-600 border-b-2 border-brand-600'
            : 'text-text-muted'
          }`}
      >
        {panel === 'palette' ? 'Add Fields' : panel === 'canvas' ? 'Canvas' : 'Properties'}
      </button>
    ))}
  </div>

  {/* Panel container */}
  <div className="flex flex-1 overflow-hidden min-h-0">
    {/* Field Palette */}
    <div className={`
      lg:block lg:w-[--palette-width] lg:border-r lg:border-border
      ${mobilePanel === 'palette' ? 'block w-full' : 'hidden'}
      overflow-y-auto bg-surface-raised
    `}>
      <FieldPalette formId={formId} onFieldAdded={handleFieldAdded} />
    </div>

    {/* Canvas */}
    <div className={`
      lg:flex lg:flex-1
      ${mobilePanel === 'canvas' ? 'flex flex-1' : 'hidden lg:flex'}
      flex-col overflow-y-auto min-w-0
    `}>
      <BuilderCanvas
        formId={formId}
        selectedFieldId={selectedFieldId}
        onSelectField={(id) => {
          setSelectedFieldId(id)
          setMobilePanel('properties')  // auto-switch to properties on mobile when field selected
        }}
      />
    </div>

    {/* Properties Panel */}
    <div className={`
      lg:block lg:w-[--properties-width] lg:border-l lg:border-border
      ${mobilePanel === 'properties' ? 'block w-full' : 'hidden'}
      overflow-y-auto bg-surface
    `}>
      <PropertiesPanel formId={formId} fieldId={selectedFieldId} />
    </div>
  </div>
</div>
```

#### Builder Header — responsive

```jsx
// Header: 'flex items-center gap-2 sm:gap-3 px-3 sm:px-4 border-b border-border bg-surface
//          h-[--builder-header-height] shrink-0 overflow-hidden'

// On mobile, collapse Save Draft + Publish into a single "•••" menu or icon buttons
// Minimum: show only Publish button on mobile, hide Save Draft behind overflow menu

// Mobile header layout:
// [← Back] [Title truncated] [Share icon] [Publish btn]
// Desktop header layout:
// [← Back] [Title editable] [Status badge] [Share btn] [Save Draft btn] [Publish btn]
```

### `Analytics.jsx`

```jsx
// Page wrapper: 'p-4 sm:p-6 lg:p-8 max-w-[--content-max-width] mx-auto'
// Header: 'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8'
// Stat cards: 'grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 mt-6 sm:mt-8'

// ResponseTable — wrap in horizontally scrollable container:
<div className="overflow-x-auto rounded-[--radius-xl] border border-border">
  <table className="w-full text-sm text-left min-w-[540px]">
    ...
  </table>
</div>
// The min-w-[540px] ensures table doesn't collapse, outer div scrolls on mobile

// QuestionChart — charts need explicit height and width handling:
// ResponsiveContainer already handles width, ensure height is fixed: height={180} on mobile
// Wrap each chart card in: 'bg-surface rounded-[--radius-xl] border border-border shadow-sm p-4 sm:p-6'
```

### `PublicForm.jsx`

```jsx
// Already mostly responsive from Phase 4/6 — verify these:
// Outer: 'min-h-screen bg-surface-raised py-8 px-4 sm:py-12'
// Inner: 'max-w-2xl mx-auto'
// Form card: 'bg-surface rounded-[--radius-xl] shadow-md border border-border p-5 sm:p-8'
// Submit button: 'w-full' (already full-width — good)
// Scale buttons: ensure they wrap on small screens:
//   'flex flex-wrap gap-2' instead of 'flex gap-2'
```

---

## Part 6 — Component-Level Responsive Fixes

### `FieldPalette.jsx`

```jsx
// Panel header: 'px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider
//                border-b border-border'
// Field items: 'flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary
//               hover:bg-brand-50 hover:text-brand-600 cursor-pointer transition-colors'
// No horizontal overflow needed — it's full-width on mobile
```

### `FieldCard.jsx`

```jsx
// Card: 'group bg-surface border border-border rounded-[--radius-lg] shadow-sm
//         hover:shadow-md hover:border-border-strong transition-all mb-2 mx-3 sm:mx-4'
// Selected: add 'ring-2 ring-brand-500 border-brand-300'
// Inner: 'flex items-start gap-2 p-3 sm:p-4'
// Drag handle: 'text-text-disabled group-hover:text-text-muted cursor-grab mt-0.5 shrink-0'
// Field preview: 'flex-1 min-w-0' (min-w-0 prevents flex overflow)
// Delete: 'shrink-0 opacity-0 group-hover:opacity-100 transition-opacity'
```

### `PropertiesPanel.jsx`

```jsx
// Panel header: 'px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider
//                border-b border-border sticky top-0 bg-surface z-10'
// Content: 'px-4 py-4 space-y-5'
// Each control: label + input, consistent spacing
// Options list: 'space-y-2'
// Option row: 'flex items-center gap-2'
// Option input: 'flex-1 min-w-0'  ← min-w-0 prevents overflow
```

### `StatCard.jsx`

```jsx
// Card: 'bg-surface rounded-[--radius-xl] border border-border shadow-sm p-4 sm:p-6'
// Icon + label row: 'flex items-center gap-1.5 text-text-muted text-xs sm:text-sm'
// Value: 'mt-2 text-2xl sm:text-3xl font-bold text-text-primary'
```

### `ResponseTable.jsx`

```jsx
// Outer: 'overflow-x-auto'
// Table: 'w-full text-sm text-left min-w-[520px]'
// Header cells: 'px-3 sm:px-4 py-3 text-xs font-medium text-text-muted uppercase bg-surface-overlay'
// Body cells: 'px-3 sm:px-4 py-3 text-text-secondary'
// Row hover: 'hover:bg-surface-raised transition-colors'
```

### `ShareModal.jsx`

```jsx
// Link input row: 'flex flex-col gap-2 sm:flex-row'
// On mobile the Copy button is full-width below the input
// Email input row: same 'flex flex-col gap-2 sm:flex-row' pattern
// Invite list: max-h-40 overflow-y-auto
```

---

## Part 7 — Recharts Color Update

In `QuestionChart.jsx`, update the hardcoded `#6366f1` fill to use the CSS variable:

```jsx
// Recharts doesn't accept Tailwind classes, use CSS var directly:
<Cell key={i} fill="var(--color-brand-500)" />

// For scale avg display:
<span style={{ color: 'var(--color-brand-600)' }} className="text-2xl font-bold">
  {avg}
</span>
```

---

## Part 8 — No Overflow Audit

After all responsive changes, test every page at these widths and fix any horizontal overflow:

| Width | Device |
|---|---|
| 320px | Small mobile (iPhone SE) |
| 375px | Standard mobile (iPhone 14) |
| 768px | Tablet portrait (iPad) |
| 1024px | Tablet landscape / small laptop |
| 1280px | Desktop |

**Common overflow culprits to check:**
- Fixed-width elements without `min-w-0`
- Flex children without `overflow-hidden` or `truncate`
- Long form titles in cards — add `truncate` or `line-clamp-1`
- Long email addresses in invite list — add `truncate`
- Table without `overflow-x-auto` wrapper
- Builder canvas field labels — add `truncate`
- `min-w-0` on ALL flex children that contain text

**Quick overflow detector** — add this temporarily to `index.css` while testing, remove before committing:
```css
/* DEBUG — remove before commit */
* { outline: 1px solid red !important; }
```

---

## Git Commit (after all acceptance criteria pass)

```bash
git checkout development
git add .
git commit -m "feat: design system tokens + full responsive layout (Phase 7)"
```

---

## Acceptance Criteria

### Design System
- [ ] All color tokens defined in `src/index.css` under `@theme {}`
- [ ] Zero hardcoded `blue-`, `indigo-`, `gray-` color classes remaining in `.jsx` files (except Recharts)
- [ ] All primitives (Button, Input, Badge, Modal, EmptyState, Toast) use token classes
- [ ] Recharts fills use `var(--color-brand-500)` CSS variable
- [ ] Global focus ring defined and visible on all interactive elements
- [ ] Scrollbar styled consistently

### Responsive — Mobile (320px–767px)
- [ ] Dashboard: single-column card grid, header stacks vertically
- [ ] Dashboard: "New Form" modal is full-width and usable
- [ ] Builder: tab switcher visible with Palette / Canvas / Properties tabs
- [ ] Builder: selecting a field auto-switches to Properties tab
- [ ] Builder: header shows condensed controls (Publish button visible, Save Draft hidden or in overflow)
- [ ] Public Form: all field types render correctly, scale buttons wrap
- [ ] Analytics: stat cards in 2-column grid, response table horizontally scrollable
- [ ] Sidebar: hidden by default, opens via hamburger button with backdrop overlay

### Responsive — Tablet (768px–1023px)
- [ ] Dashboard: 2-column card grid
- [ ] Builder: tab mode still active (3-panel only at ≥ 1024px)
- [ ] Analytics: 2-column stat cards, charts readable
- [ ] Sidebar: still in overlay/hamburger mode

### Responsive — Desktop (≥ 1024px)
- [ ] Builder: 3-panel layout fully restored (Palette | Canvas | Properties)
- [ ] Sidebar: permanently visible, no hamburger
- [ ] All pages: max-width container centered on very wide screens

### No Overflow
- [ ] No horizontal scrollbar on any page at any tested width (320px–1440px)
- [ ] All long text (titles, emails, labels) truncated correctly
- [ ] All flex children have `min-w-0` where needed
- [ ] Debug outline CSS removed before commit

### General
- [ ] `npm run dev` starts without errors
- [ ] No console errors on any page
- [ ] Committed to `development` branch
