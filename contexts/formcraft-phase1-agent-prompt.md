# FormCraft — Coding Agent Prompt: Phase 1 (Project Foundation)

## Your Task

Scaffold the **FormCraft** project from scratch. FormCraft is a drag-and-drop form builder where users create survey forms, share them via a public link, collect responses, and view per-form analytics.

You are implementing **Phase 1 only**: the project foundation. No feature pages yet — just the skeleton everything else will be built on.

---

## Output Requirements

Bootstrap a complete Vite + React project at `./formcraft/` with the exact folder structure below. Every file must be created — either fully implemented (for config, store, lib, and UI primitives) or as a documented stub (for pages and feature components).

---

## Tech Stack

| Layer | Package |
|---|---|
| Framework | React 18 |
| Build tool | Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS v3 |
| State | Zustand |
| Drag & Drop | `@dnd-kit/core` + `@dnd-kit/sortable` (install now, use later) |
| Charts | Recharts (install now, use later) |
| Icons | Lucide React |
| IDs | nanoid |

Install all packages upfront so later phases never touch `package.json`.

---

## Folder Structure to Create

```
formcraft/
├── public/
│   └── favicon.svg               # Simple SVG icon (any minimal shape)
│
├── src/
│   ├── main.jsx                  # React root + BrowserRouter
│   ├── App.jsx                   # Route definitions
│   │
│   ├── store/
│   │   ├── useFormStore.js       # Zustand: forms slice
│   │   └── useSubmissionStore.js # Zustand: submissions + invites slice
│   │
│   ├── lib/
│   │   ├── storage.js            # localStorage helpers
│   │   ├── idgen.js              # nanoid wrappers
│   │   └── csv.js                # CSV export utility
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   └── Toast.jsx
│   │   │
│   │   ├── layout/
│   │   │   ├── AppShell.jsx
│   │   │   └── Sidebar.jsx
│   │   │
│   │   ├── builder/
│   │   │   ├── FieldPalette.jsx
│   │   │   ├── BuilderCanvas.jsx
│   │   │   ├── FieldCard.jsx
│   │   │   ├── PropertiesPanel.jsx
│   │   │   └── fields/
│   │   │       ├── TextField.jsx
│   │   │       ├── TextareaField.jsx
│   │   │       ├── MultipleChoiceField.jsx
│   │   │       ├── CheckboxField.jsx
│   │   │       ├── ScaleField.jsx
│   │   │       ├── DropdownField.jsx
│   │   │       ├── EmailField.jsx
│   │   │       ├── DateField.jsx
│   │   │       └── HeadingField.jsx
│   │   │
│   │   ├── form/
│   │   │   ├── FormRenderer.jsx
│   │   │   └── ThankYou.jsx
│   │   │
│   │   └── analytics/
│   │       ├── StatCard.jsx
│   │       ├── QuestionChart.jsx
│   │       └── ResponseTable.jsx
│   │
│   └── pages/
│       ├── Dashboard.jsx
│       ├── Builder.jsx
│       ├── Analytics.jsx
│       └── PublicForm.jsx
│
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Implementation Specs by File

### `src/main.jsx`
- Wrap `<App />` in `<BrowserRouter>` from React Router v6.
- Import and apply global Tailwind CSS (`./index.css`).

### `src/App.jsx`
- Define all 4 routes using `<Routes>` + `<Route>`:
  - `/` → `<Dashboard />`
  - `/builder/:formId` → `<Builder />`  
  - `/analytics/:formId` → `<Analytics />`
  - `/f/:formId` → `<PublicForm />`
- Dashboard, Builder, Analytics routes should be wrapped in `<AppShell>`.
- PublicForm is standalone (no sidebar/shell).

---

### `src/store/useFormStore.js`

Implement a Zustand store with localStorage persistence (`persist` middleware). State and actions:

```js
// State
forms: Form[]   // starts as []

// Actions
createForm(title)        // creates a new Form, returns id
updateForm(id, patch)    // shallow-merges patch into form
deleteForm(id)           // removes form by id
publishForm(id)          // sets status: 'published', sets shareToken if empty
saveDraft(id)            // sets status: 'draft'
getForm(id)              // returns single form by id
```

**Form shape:**
```js
{
  id: string,           // nanoid()
  title: string,
  description: '',
  fields: [],
  status: 'draft',
  createdAt: new Date().toISOString(),
  shareToken: '',        // nanoid() assigned on first publish
  submitMessage: 'Thank you for your response!'
}
```

Use `persist` from `zustand/middleware` with key `'formcraft-forms'`.

---

### `src/store/useSubmissionStore.js`

Zustand store with localStorage persistence. State and actions:

```js
// State
submissions: Submission[]
invites: Invite[]

// Actions
addSubmission(submission)         // appends to submissions[]
getSubmissionsByForm(formId)      // returns filtered array
addInvite(invite)                 // appends to invites[]
getInvitesByForm(formId)          // returns filtered array
markInviteOpened(inviteId)        // sets openedAt: now
markInviteSubmitted(inviteId)     // sets submittedAt: now
```

**Submission shape:**
```js
{
  id: string,
  formId: string,
  responses: {},         // Record<fieldId, string | string[]>
  submittedAt: string,
  duration: number,      // seconds
  device: 'mobile' | 'desktop' | 'tablet'
}
```

**Invite shape:**
```js
{
  id: string,
  formId: string,
  email: string,
  sentAt: string,
  openedAt: null,
  submittedAt: null
}
```

Use `persist` with key `'formcraft-submissions'`.

---

### `src/lib/storage.js`

Simple wrappers (the stores use `persist`, but these are available for direct reads):

```js
export const storage = {
  get: (key) => JSON.parse(localStorage.getItem(key) ?? 'null'),
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  remove: (key) => localStorage.removeItem(key),
}
```

---

### `src/lib/idgen.js`

```js
import { nanoid } from 'nanoid'
export const generateId = () => nanoid()
export const generateShareToken = () => nanoid(10)
```

---

### `src/lib/csv.js`

```js
// Takes a form and its submissions, returns a CSV string
export function exportToCSV(form, submissions) {
  // Columns: submittedAt, duration, device, then one column per field (using field.label)
  // Rows: one per submission
  // Returns the CSV as a string; caller triggers the download
}

// Helper to trigger browser download
export function downloadCSV(filename, csvString) { ... }
```

Implement both functions fully.

---

### `src/components/ui/Button.jsx`

Variants: `primary`, `secondary`, `ghost`, `danger`. Sizes: `sm`, `md`, `lg`.
Use Tailwind. Accept `className`, `disabled`, `onClick`, `type`, `children`.

---

### `src/components/ui/Input.jsx`

Props: `label`, `placeholder`, `value`, `onChange`, `type`, `error`, `required`, `className`.
Show label above, error message below in red when `error` is set.

---

### `src/components/ui/Badge.jsx`

Variants driven by a `variant` prop: `draft` (gray), `published` (green), `default` (blue).
Small pill shape. Accept `children` and `className`.

---

### `src/components/ui/Modal.jsx`

Props: `isOpen`, `onClose`, `title`, `children`.
Renders a centered overlay modal. Closes on backdrop click or Escape key.
Use a portal (`ReactDOM.createPortal`) into `document.body`.

---

### `src/components/ui/EmptyState.jsx`

Props: `icon` (Lucide component), `title`, `description`, `action` (optional JSX button).
Centered layout, muted styling. Used for empty forms list, no responses yet, etc.

---

### `src/components/ui/Toast.jsx`

Simple toast system. Export a `ToastProvider` (wraps app) and a `useToast()` hook with:
- `toast.success(message)`
- `toast.error(message)`
- `toast.info(message)`

Toasts appear bottom-right, auto-dismiss after 3 seconds, max 3 visible.

---

### `src/components/layout/AppShell.jsx`

Layout: fixed-width `<Sidebar />` on the left, `<main>` content area to the right taking remaining width.
Renders `{children}` inside `<main>`.

---

### `src/components/layout/Sidebar.jsx`

- FormCraft logo/wordmark at the top.
- Nav link to `/` (Dashboard) with a `LayoutDashboard` icon.
- Bottom: a subtle version tag or attribution.
- Highlight the active route using React Router's `useLocation`.

---

### All other components (stubs)

Every remaining component file must exist as a documented stub:

```jsx
// BuilderCanvas.jsx
// Phase 3 — Form Builder
// Renders the DnD drop zone and the sorted list of FieldCards.
// Props: formId (string)

export default function BuilderCanvas({ formId }) {
  return <div>BuilderCanvas — coming in Phase 3</div>
}
```

Use the same pattern for: `FieldPalette`, `FieldCard`, `PropertiesPanel`, all 9 `fields/` components, `FormRenderer`, `ThankYou`, `StatCard`, `QuestionChart`, `ResponseTable`.

---

### Pages

Each page is a stub with the route name, its path, and which phase implements it:

```jsx
// Dashboard.jsx
// Route: /
// Phase 2 — Forms list with create, delete, and form cards

export default function Dashboard() {
  return <div className="p-8">Dashboard — Phase 2</div>
}
```

Same pattern for `Builder.jsx` (`/builder/:formId`, Phase 3), `Analytics.jsx` (`/analytics/:formId`, Phase 5), `PublicForm.jsx` (`/f/:formId`, Phase 4).

---

### Config Files

**`tailwind.config.js`**
- Content paths: `./index.html`, `./src/**/*.{js,jsx}`
- No custom theme needed for Phase 1 — defaults are fine.

**`vite.config.js`**
- Standard React plugin setup.
- No aliases needed.

**`index.html`**
- Title: `FormCraft`
- Mount point: `<div id="root">`
- Links to `src/main.jsx`

**`src/index.css`**
- Tailwind directives: `@tailwind base; @tailwind components; @tailwind utilities;`

---

## Acceptance Criteria

When Phase 1 is complete:

1. `npm install` runs without errors.
2. `npm run dev` starts the dev server.
3. Navigating to `/` shows the AppShell with sidebar + "Dashboard — Phase 2" placeholder.
4. Navigating to `/builder/test` shows the AppShell with sidebar + "Builder — Phase 3" placeholder.
5. Navigating to `/f/test` shows the PublicForm stub (no sidebar).
6. Both Zustand stores are initialized and persisted to localStorage (visible in DevTools → Application → Local Storage).
7. No TypeScript — plain `.js` / `.jsx` throughout.
8. No console errors on load.

---

## Notes

- Do not implement any feature UI yet — pages and feature components are stubs.
- Do NOT use TypeScript — `.js` and `.jsx` only.
- Tailwind utility classes only — no custom CSS files beyond `index.css`.
- The `lib/csv.js` `exportToCSV` and `downloadCSV` functions should be fully implemented even in Phase 1, as they're pure utilities with no UI dependency.
- Use named exports for all UI primitives, default exports for pages and layout components.
