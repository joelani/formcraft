# FormCraft — Coding Agent Prompt: Phase 2 (Dashboard)

## Context

Phase 1 is complete. The project has:
- Vite + React 18 + Tailwind CSS v4 + React Router v6
- Zustand stores: `useFormStore.js` and `useSubmissionStore.js` with localStorage persistence
- UI primitives: `Button`, `Input`, `Badge`, `Modal`, `EmptyState`, `Toast`
- Layout: `AppShell` + `Sidebar`
- All pages are currently stubs

You are implementing **Phase 2: the Dashboard** at route `/`.

---

## Goal

Build the full Dashboard page so users can:
1. See all their forms in a grid of cards
2. Create a new form via a modal
3. Navigate to the builder or analytics from each card
4. Delete a form with a confirmation step

No new files or folders are needed — all work happens in existing files.

---

## Files to Edit

| File | What changes |
|---|---|
| `src/pages/Dashboard.jsx` | Full implementation (currently a stub) |
| `src/components/ui/Badge.jsx` | Verify `draft` / `published` variants exist — add if missing |
| `src/components/ui/EmptyState.jsx` | Verify it accepts `icon`, `title`, `description`, `action` props |
| `src/store/useFormStore.js` | Verify `createForm`, `deleteForm`, `getForm` work as specified — fix if needed |

Do **not** create any new files.

---

## Dashboard.jsx — Full Spec

### Layout

```
┌─────────────────────────────────────────────────────┐
│  Header: "My Forms"           [+ New Form] button   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ FormCard │  │ FormCard │  │ FormCard │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                     │
│  (EmptyState if no forms)                           │
└─────────────────────────────────────────────────────┘
```

- Page padding: `p-8`
- Header: flex row, space-between, `"My Forms"` as an `h1`, `+ New Form` Button (primary variant)
- Form grid: `grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3` below the header
- When `forms.length === 0`: render `<EmptyState>` instead of the grid

### Data

Pull all forms from `useFormStore`:

```js
const forms = useFormStore((s) => s.forms)
const createForm = useFormStore((s) => s.createForm)
const deleteForm = useFormStore((s) => s.deleteForm)
```

Pull submission counts from `useSubmissionStore` to show per-card response count:

```js
const getSubmissionsByForm = useSubmissionStore((s) => s.getSubmissionsByForm)
```

---

### "New Form" Flow

1. Clicking `+ New Form` opens a **Create Form Modal**.
2. Modal contains a single text `Input` labelled `"Form title"` with placeholder `"e.g. Customer Feedback Survey"`.
3. `Create` button (primary) calls `createForm(title)` → receives the new form's `id` → navigates to `/builder/:id` via `useNavigate`.
4. `Cancel` button (ghost) closes the modal without creating anything.
5. The `Create` button is disabled if the title input is empty or whitespace-only.
6. Pressing `Enter` in the input submits the form.
7. Modal closes and resets the input after successful creation.

```jsx
// Rough shape
const [modalOpen, setModalOpen] = useState(false)
const [title, setTitle] = useState('')
const navigate = useNavigate()

function handleCreate() {
  if (!title.trim()) return
  const id = createForm(title.trim())
  setModalOpen(false)
  setTitle('')
  navigate(`/builder/${id}`)
}
```

---

### FormCard Component

Build this as a local component inside `Dashboard.jsx` (do not create a separate file).

**Props:** `form` (Form object)

**Card anatomy:**

```
┌────────────────────────────────────┐
│  [draft badge]                     │  ← top-left
│                                    │
│  Customer Feedback Survey          │  ← form.title (h2, truncated)
│  form.description or "No desc..."  │  ← muted, 2-line clamp
│                                    │
│  3 responses  ·  Jan 14, 2025      │  ← response count + createdAt
│                                    │
│  [Open Builder]  [Analytics]  [🗑] │  ← action row
└────────────────────────────────────┘
```

**Detailed requirements:**

- Card has a white background, border, rounded corners, subtle shadow, hover shadow transition.
- `Badge` uses `variant="draft"` or `variant="published"` based on `form.status`.
- Title: `font-semibold text-gray-900`, truncated with `truncate` if too long.
- Description: `text-sm text-gray-500`, clamped to 2 lines (`line-clamp-2`). If `form.description` is empty, show `"No description"` in italic.
- Stats row: response count (from `getSubmissionsByForm(form.id).length`) + formatted `createdAt` date. Separated by a `·` character. `text-xs text-gray-400`.
- Action row at the bottom:
  - **"Open Builder"** button (secondary, sm) → navigates to `/builder/:formId`
  - **"Analytics"** button (ghost, sm) → navigates to `/analytics/:formId`
  - **Delete icon button** (danger, sm, icon-only) — Lucide `Trash2` icon → triggers delete confirmation

**Date formatting:** Use `new Date(form.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })`.

---

### Delete Confirmation Flow

Do **not** use the browser's `window.confirm`. Use the existing `<Modal>` component.

Flow:
1. User clicks the trash icon on a card.
2. A confirmation modal opens with:
   - Title: `"Delete form?"`
   - Body: `"This will permanently delete "{form.title}" and all its responses. This cannot be undone."`
   - Two buttons: `"Cancel"` (ghost) and `"Delete"` (danger)
3. Clicking `"Delete"` calls `deleteForm(form.id)` and closes the modal.
4. Clicking `"Cancel"` or the backdrop closes the modal without deleting.

Manage this with two state vars:

```js
const [deleteTarget, setDeleteTarget] = useState(null) // form object or null
```

`deleteTarget !== null` means the modal is open for that form.

---

### Empty State

When `forms.length === 0`, render:

```jsx
<EmptyState
  icon={FileText}  // from lucide-react
  title="No forms yet"
  description="Create your first form to start collecting responses."
  action={
    <Button variant="primary" onClick={() => setModalOpen(true)}>
      + New Form
    </Button>
  }
/>
```

---

## Store Checks

Before building the UI, verify these store behaviours work correctly:

### `useFormStore.js`

`createForm(title)` must:
- Generate a unique `id` via `generateId()` from `src/lib/idgen.js`
- Generate a `shareToken` via `generateShareToken()`
- Create the form object with all required fields
- Push it into `forms[]`
- **Return the new form's `id`** — the Dashboard `handleCreate` depends on this return value

If `createForm` doesn't return the id, fix it now.

```js
createForm: (title) => {
  const id = generateId()
  const form = {
    id,
    title,
    description: '',
    fields: [],
    status: 'draft',
    createdAt: new Date().toISOString(),
    shareToken: generateShareToken(),
    submitMessage: 'Thank you for your response!',
  }
  set((s) => ({ forms: [...s.forms, form] }))
  return id  // ← critical
},
```

`deleteForm(id)` must filter out the form by id:

```js
deleteForm: (id) => set((s) => ({ forms: s.forms.filter((f) => f.id !== id) })),
```

---

## Sidebar Update

Update `src/components/layout/Sidebar.jsx` so the Dashboard nav link is visually active when on `/`. Use `useLocation` from React Router and apply an active class (e.g. different background or text color) when `location.pathname === '/'`.

---

## Acceptance Criteria

- [ ] Dashboard renders at `/` inside `AppShell` with the sidebar visible
- [ ] `+ New Form` button opens the Create Form Modal
- [ ] Entering a title and clicking `Create` creates a form and redirects to `/builder/:id`
- [ ] The `Create` button is disabled when the title field is empty
- [ ] All existing forms render as cards in a responsive grid
- [ ] Each card shows: title, status badge, description, response count, created date
- [ ] "Open Builder" navigates to `/builder/:formId`
- [ ] "Analytics" navigates to `/analytics/:formId`
- [ ] Clicking the trash icon opens the delete confirmation modal
- [ ] Confirming delete removes the form from the list
- [ ] Cancelling delete does nothing
- [ ] When no forms exist, the `EmptyState` is shown with a working `+ New Form` action
- [ ] New forms persist on page refresh (Zustand `persist` via localStorage)
- [ ] No console errors
