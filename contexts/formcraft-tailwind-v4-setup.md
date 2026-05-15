# FormCraft — Coding Agent Prompt: Migrate to Tailwind CSS v4

## Context

The project was scaffolded with **Tailwind CSS v3**. You need to fully remove it and install **Tailwind CSS v4** correctly. Tailwind v4 is architecturally different from v3 — read every step carefully before touching any file.

---

## What Changed in v4 vs v3 (Read This First)

| v3 | v4 |
|---|---|
| `npm install -D tailwindcss postcss autoprefixer` | `npm install tailwindcss @tailwindcss/vite` |
| Config lives in `tailwind.config.js` | **No `tailwind.config.js`** — config lives in CSS |
| `vite.config.js` uses PostCSS plugin chain | v4 uses its own `@tailwindcss/vite` Vite plugin |
| `@tailwind base; @tailwind components; @tailwind utilities;` in CSS | Single `@import "tailwindcss";` in CSS |
| Content paths defined in `tailwind.config.js` | **Auto-detected** — no content array needed |
| Theme customisation via JS `theme: { extend: {} }` | Theme customisation via `@theme {}` block in CSS |
| `postcss.config.js` required | **Not needed** — Vite plugin handles everything |

---

## Step 1 — Uninstall Tailwind v3 and Related Packages

Run this in the `formcraft/` project root:

```bash
npm uninstall tailwindcss postcss autoprefixer
```

Also delete these files if they exist:

```bash
rm -f tailwind.config.js
rm -f postcss.config.js
rm -f postcss.config.cjs
```

Verify they are gone before continuing.

---

## Step 2 — Install Tailwind v4

```bash
npm install tailwindcss @tailwindcss/vite
```

This installs:
- `tailwindcss` — the v4 core
- `@tailwindcss/vite` — the official Vite plugin (replaces the old PostCSS chain entirely)

Do **not** install `postcss`, `autoprefixer`, or `@tailwindcss/postcss` — they are not needed with the Vite plugin approach.

---

## Step 3 — Update `vite.config.js`

Replace the entire file with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

Key point: `tailwindcss()` must be in the plugins array. Order doesn't matter relative to `react()`.

---

## Step 4 — Update `src/index.css`

Replace the entire file contents with:

```css
@import "tailwindcss";
```

That's it. Do NOT use the old v3 directives:

```css
/* ❌ DELETE THESE — v3 syntax, will not work in v4 */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Step 5 — Delete `tailwind.config.js`

Tailwind v4 has **no JavaScript config file**. Delete it:

```bash
rm -f tailwind.config.js
```

Content paths are auto-detected in v4. The framework scans your source files automatically — no `content: []` array required.

---

## Step 6 — Verify `src/main.jsx` Imports the CSS

Make sure `src/main.jsx` imports `index.css`:

```jsx
import './index.css'  // ← this must be present
```

---

## Step 7 — Smoke Test

Run the dev server:

```bash
npm run dev
```

Open the browser and verify Tailwind is working by checking that any element with a Tailwind class is styled. A quick test: add `className="text-red-500 text-2xl font-bold"` to any visible element and confirm it renders red and large. Remove the test class after confirming.

---

## What NOT to Do

- ❌ Do not create a `tailwind.config.js` — v4 doesn't use one
- ❌ Do not create a `postcss.config.js` — not needed with the Vite plugin
- ❌ Do not install `autoprefixer` or `postcss` separately — built into v4
- ❌ Do not use `@tailwind base/components/utilities` directives — v3 only
- ❌ Do not add a `content` array anywhere — v4 auto-detects source files

---

## Custom Theme (For Later Phases)

In v4, if you need to add custom design tokens (colors, fonts, spacing), you do it in `src/index.css` using the `@theme` directive — not in a JS config file:

```css
@import "tailwindcss";

@theme {
  --color-brand: #6366f1;
  --font-display: "Inter", sans-serif;
  --breakpoint-3xl: 1920px;
}
```

These tokens become CSS variables AND generate Tailwind utility classes automatically (e.g. `bg-brand`, `font-display`). You do not need to touch any config file.

---

## Acceptance Criteria

- [ ] `tailwindcss` and `@tailwindcss/vite` are in `package.json` dependencies
- [ ] `postcss`, `autoprefixer` are NOT in `package.json`
- [ ] `tailwind.config.js` does not exist in the project root
- [ ] `postcss.config.js` does not exist in the project root
- [ ] `vite.config.js` imports and uses `tailwindcss` from `@tailwindcss/vite`
- [ ] `src/index.css` contains only `@import "tailwindcss";` (plus any future `@theme` blocks)
- [ ] `npm run dev` starts without errors
- [ ] Tailwind utility classes render correctly in the browser
