# FormCraft — Coding Agent Prompt: Builder Layout Fix

## Context

Phase 7 responsive work is done. One issue remains with the Builder page:

- The desktop 3-panel layout was changed during Phase 7 and needs to be restored
- The mobile header is missing the form title

This prompt addresses **only `src/pages/Builder.jsx`** and **`src/components/layout/AppShell.jsx`** (mobile header only). Do not touch any other file.

---

## Fix 1 — Desktop Layout: Restore 3-Panel (≥ 1024px)

### What it must look like

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER BAR (full width, fixed height)                            │
├─────────────────┬──────────────────────────┬─────────────────────┤
│  Field Palette  │      Builder Canvas      │  Properties Panel   │
│  w-[220px]      │      flex-1              │  w-[280px]          │
│  always visible │      scrollable          │  always visible     │
│  never hidden   │                          │  never collapses    │
└─────────────────┴──────────────────────────┴─────────────────────┘
```

### Rules
- All 3 panels are **permanently visible** on desktop — no toggling, no collapsing, no tabs
- The Properties Panel is always open on the right. When no field is selected it shows `"Select a field to edit its properties"`. When a field is selected it shows that field's controls in place
- No drawer, no modal, no expand animation — the panel just updates its content in place
- The 3-panel row fills the remaining height below the header: `flex-1 overflow-hidden`
- Each panel scrolls independently: `overflow-y-auto h-full`

### Layout structure

```jsx
<div className="flex flex-col h-screen overflow-hidden">
  {/* Header — always full width */}
  <BuilderHeader ... />

  {/* Mobile tab bar — ONLY visible below lg */}
  <div className="flex lg:hidden ...">
    {/* Palette | Canvas | Properties tabs */}
  </div>

  {/* 3-panel row */}
  <div className="flex flex-1 overflow-hidden min-h-0">

    {/* LEFT — Field Palette */}
    <aside className={`
      w-[var(--palette-width)] border-r border-border bg-surface-raised
      overflow-y-auto shrink-0
      hidden lg:block
      ${mobilePanel === 'palette' ? '!block w-full' : ''}
    `}>
      <FieldPalette formId={formId} onFieldAdded={handleFieldAdded} />
    </aside>

    {/* CENTER — Canvas */}
    <main className={`
      flex-1 overflow-y-auto min-w-0 bg-surface-raised
      hidden lg:block
      ${mobilePanel === 'canvas' ? '!block' : ''}
    `}>
      <BuilderCanvas
        formId={formId}
        selectedFieldId={selectedFieldId}
        onSelectField={(id) => {
          setSelectedFieldId(id)
          if (window.innerWidth < 1024) setMobilePanel('properties')
        }}
      />
    </main>

    {/* RIGHT — Properties Panel */}
    <aside className={`
      w-[var(--properties-width)] border-l border-border bg-surface
      overflow-y-auto shrink-0
      hidden lg:block
      ${mobilePanel === 'properties' ? '!block w-full' : ''}
    `}>
      <PropertiesPanel formId={formId} fieldId={selectedFieldId} />
    </aside>

  </div>
</div>
```

---

## Fix 2 — Mobile Header: Show Form Title

The current mobile header inside `AppShell.jsx` shows only the hamburger + "FormCraft" wordmark. On the Builder page specifically, the form title should appear instead of the generic wordmark.

### Approach

Pass an optional `mobileTitle` prop through `AppShell`:

```jsx
// AppShell.jsx
export default function AppShell({ children, mobileTitle }) {
  ...
  {/* Mobile top bar */}
  <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-surface shrink-0">
    <button onClick={() => setSidebarOpen(true)} className="text-text-secondary shrink-0">
      <Menu size={20} />
    </button>
    <span className="font-semibold text-text-primary truncate flex-1">
      {mobileTitle || 'FormCraft'}
    </span>
  </div>
}
```

Then in `Builder.jsx`, pass the form title:

```jsx
<AppShell mobileTitle={form?.title || 'Form Builder'}>
  ...
</AppShell>
```

This way:
- Dashboard, Analytics → show `"FormCraft"` (no prop passed)
- Builder → shows the actual form title, truncated if long

---

## Acceptance Criteria

- [ ] Desktop (≥ 1024px): all 3 panels visible simultaneously — Palette, Canvas, Properties
- [ ] Desktop: Properties Panel always rendered on the right, never hidden
- [ ] Desktop: selecting a field updates Properties Panel content in place — no layout shift
- [ ] Desktop: no field selected shows `"Select a field to edit its properties"` in the right panel
- [ ] Mobile (< 1024px): tab switcher unchanged — Palette / Canvas / Properties tabs still work
- [ ] Mobile: selecting a field still auto-switches to the Properties tab
- [ ] Mobile Builder header shows the form title (truncated if long)
- [ ] Other pages (Dashboard, Analytics) still show `"FormCraft"` in the mobile header
- [ ] No console errors
