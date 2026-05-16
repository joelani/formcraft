# FormCraft — Coding Agent Prompt: Fix Radius, Shadow & Spacing Tokens

## Context

The design system tokens are defined in `src/index.css` under `@theme {}` but radius and shadow utility classes are not applying correctly across the app. The issue is a syntax mismatch — the agent used arbitrary bracket syntax (`rounded-[--radius-md]`) instead of the direct utility classes that Tailwind v4 generates automatically from `@theme` token names.

This prompt fixes that across every `.jsx` file. Do not change any logic, layout, or color — only fix radius, shadow, and spacing token usage.

---

## Root Cause

In Tailwind v4, defining `--radius-md` in `@theme {}` automatically generates the utility class `rounded-md` mapped to that value. You do **not** use bracket syntax to reference it.

Same applies to shadows: `--shadow-md` generates `shadow-md`.

Spacing variables (`--sidebar-width`, `--palette-width`, `--properties-width`) do **not** generate utilities — they must be referenced via `w-[var(--sidebar-width)]` syntax. That is correct and expected.

---

## Step 1 — Verify `src/index.css` tokens are named correctly

Ensure `@theme {}` contains exactly these radius and shadow entries (names must match precisely):

```css
@theme {
  /* Radius — generates: rounded-sm, rounded-md, rounded-lg, rounded-xl, rounded-full */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px;

  /* Shadow — generates: shadow-sm, shadow-md, shadow-lg, shadow-xl */
  --shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  --shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05);
  --shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.05);
}
```

Do not rename or remove any other tokens in the file.

---

## Step 2 — Global find-and-replace across all `.jsx` files

Run these replacements across every file in `src/`. Do all of them — not just the ones you think are affected.

### Radius replacements

| Find (wrong) | Replace with (correct) |
|---|---|
| `rounded-[--radius-sm]` | `rounded-sm` |
| `rounded-[--radius-md]` | `rounded-md` |
| `rounded-[--radius-lg]` | `rounded-lg` |
| `rounded-[--radius-xl]` | `rounded-xl` |
| `rounded-[--radius-full]` | `rounded-full` |
| `rounded-[var(--radius-sm)]` | `rounded-sm` |
| `rounded-[var(--radius-md)]` | `rounded-md` |
| `rounded-[var(--radius-lg)]` | `rounded-lg` |
| `rounded-[var(--radius-xl)]` | `rounded-xl` |
| `rounded-[var(--radius-full)]` | `rounded-full` |

### Shadow replacements

| Find (wrong) | Replace with (correct) |
|---|---|
| `shadow-[--shadow-sm]` | `shadow-sm` |
| `shadow-[--shadow-md]` | `shadow-md` |
| `shadow-[--shadow-lg]` | `shadow-lg` |
| `shadow-[--shadow-xl]` | `shadow-xl` |
| `shadow-[var(--shadow-sm)]` | `shadow-sm` |
| `shadow-[var(--shadow-md)]` | `shadow-md` |
| `shadow-[var(--shadow-lg)]` | `shadow-lg` |
| `shadow-[var(--shadow-xl)]` | `shadow-xl` |

---

## Step 3 — Spacing variables (keep as-is)

These variables do NOT generate Tailwind utilities. The correct usage is `var()` inside an arbitrary bracket. Verify these are written correctly wherever sidebar, palette, and properties widths are used:

| Variable | Correct usage in className |
|---|---|
| `--sidebar-width` | `w-[var(--sidebar-width)]` |
| `--palette-width` | `w-[var(--palette-width)]` |
| `--properties-width` | `w-[var(--properties-width)]` |
| `--builder-header-height` | `h-[var(--builder-header-height)]` |
| `--content-max-width` | `max-w-[var(--content-max-width)]` |

If any of these are written without `var()` (e.g. `w-[--sidebar-width]`), add the `var()` wrapper.

---

## Step 4 — Verify curved corners are actually applied

After the replacements, do a visual check on these specific elements:

| Element | Expected class | Expected result |
|---|---|---|
| Dashboard form cards | `rounded-xl` | Visibly curved corners |
| "New Form" modal panel | `rounded-xl` | Curved modal |
| Buttons (primary, secondary) | `rounded-md` | Slightly rounded |
| Badge | `rounded-full` | Pill shape |
| Builder field cards on canvas | `rounded-lg` | Curved field rows |
| Stat cards in Analytics | `rounded-xl` | Curved stat cards |
| Input fields | `rounded-md` | Slightly rounded inputs |
| Toast notifications | `rounded-lg` | Curved toasts |
| Properties panel items | `rounded-md` | Rounded option inputs |

If any element still appears with sharp corners after the fix, inspect it in DevTools — check if the `rounded-*` class is present and whether it's being overridden.

---

## Step 5 — After fixes, do a final search

Search across all `.jsx` files for any remaining instances of:
- `rounded-[` — should return zero results (all radius tokens now use direct utilities)
- `shadow-[` — should return zero results (unless it's a one-off custom shadow not from the token system, which is fine)
- `w-[--` without `var()` — fix any found

---

## What NOT to change

- Do not touch any color token classes (`bg-brand-*`, `text-text-*`, `bg-surface`, etc.) — those are already correct
- Do not change any layout, logic, or component structure
- Do not modify `src/index.css` beyond verifying the token names in Step 1
- Do not change spacing variable usage — keep `w-[var(--sidebar-width)]` as-is

---

## Git Commit (after visual check passes)

```bash
git checkout development
git add .
git commit -m "fix: resolve radius and shadow token syntax for Tailwind v4 (Phase 7)"
```

---

## Acceptance Criteria

- [ ] `rounded-[--radius-*]` and `rounded-[var(--radius-*)]` patterns are gone from all `.jsx` files
- [ ] `shadow-[--shadow-*]` and `shadow-[var(--shadow-*)]` patterns are gone from all `.jsx` files
- [ ] Dashboard form cards have visibly curved corners (`rounded-xl`)
- [ ] Buttons are slightly rounded (`rounded-md`)
- [ ] Badges are pill-shaped (`rounded-full`)
- [ ] Modal panel has curved corners (`rounded-xl`)
- [ ] Input fields are slightly rounded (`rounded-md`)
- [ ] Toast notifications have curved corners (`rounded-lg`)
- [ ] Spacing variables still use `var()` syntax correctly
- [ ] No console errors
- [ ] Committed to `development` branch
