# FormCraft — Coding Agent Prompt: Phase 3 (Form Builder)

## Context

Phases 1 and 2 are complete and committed to `development`. The project has:
- Zustand stores: `useFormStore` (forms CRUD + persist) and `useSubmissionStore`
- UI primitives: `Button`, `Input`, `Badge`, `Modal`, `EmptyState`, `Toast`
- Dashboard fully working at `/`
- `Builder.jsx` is currently a stub at `/builder/:formId`

You are implementing **Phase 3: the Form Builder** at `/builder/:formId`.

This is the most complex phase. Read the entire prompt before writing any code.

---

## Goal

Build a fully functional 3-panel form builder:

```
┌──────────────┬──────────────────────────┬─────────────────────┐
│ Field        │                          │                     │
│ Palette      │   Builder Canvas         │  Properties Panel   │
│ (left)       │   (center, scrollable)   │  (right)            │
│              │                          │                     │
│ [Short Ans]  │  ┌──────────────────┐    │  Label:             │
│ [Long Ans]   │  │ ≡  Question 1    │    │  [_____________]    │
│ [Multi]      │  └──────────────────┘    │                     │
│ [Checkbox]   │  ┌──────────────────┐    │  Required: [ ]      │
│ [Scale]      │  │ ≡  Question 2    │    │                     │
│ [Dropdown]   │  └──────────────────┘    │  Options:           │
│ [Email]      │                          │  [+ Add option]     │
│ [Date]       │  [Drop fields here]      │                     │
│ [Heading]    │                          │                     │
└──────────────┴──────────────────────────┴─────────────────────┘
```

---

## Files to Implement

All files already exist as stubs. Implement each one fully:

| File | Role |
|---|---|
| `src/pages/Builder.jsx` | Page shell, layout, header bar |
| `src/components/builder/FieldPalette.jsx` | Left panel — field type list |
| `src/components/builder/BuilderCanvas.jsx` | Center panel — DnD drop zone + sorted fields |
| `src/components/builder/FieldCard.jsx` | One field row on the canvas |
| `src/components/builder/PropertiesPanel.jsx` | Right panel — selected field editor |
| `src/components/builder/fields/TextField.jsx` | Canvas preview for `type: 'text'` |
| `src/components/builder/fields/TextareaField.jsx` | Canvas preview for `type: 'textarea'` |
| `src/components/builder/fields/MultipleChoiceField.jsx` | Canvas preview for `type: 'multiple'` |
| `src/components/builder/fields/CheckboxField.jsx` | Canvas preview for `type: 'checkbox'` |
| `src/components/builder/fields/ScaleField.jsx` | Canvas preview for `type: 'scale'` |
| `src/components/builder/fields/DropdownField.jsx` | Canvas preview for `type: 'dropdown'` |
| `src/components/builder/fields/EmailField.jsx` | Canvas preview for `type: 'email'` |
| `src/components/builder/fields/DateField.jsx` | Canvas preview for `type: 'date'` |
| `src/components/builder/fields/HeadingField.jsx` | Canvas preview for `type: 'heading'` |

Also update:
| File | What changes |
|---|---|
| `src/store/useFormStore.js` | Add `addField`, `updateField`, `removeField`, `reorderFields` actions |

---

## Store Updates — `useFormStore.js`

Add these actions to the existing store. Do not remove any existing actions.

```js
// Add a new field to a form
addField: (formId, fieldType) => set((s) => {
  const form = s.forms.find(f => f.id === formId)
  if (!form) return s
  const newField = {
    id: generateId(),
    type: fieldType,
    label: defaultLabelFor(fieldType),   // see label map below
    placeholder: '',
    options: ['multiple', 'checkbox', 'dropdown'].includes(fieldType)
      ? ['Option 1', 'Option 2']
      : [],
    required: false,
    order: form.fields.length,
    scaleMin: fieldType === 'scale' ? 1 : undefined,
    scaleMax: fieldType === 'scale' ? 5 : undefined,
  }
  return {
    forms: s.forms.map(f =>
      f.id === formId ? { ...f, fields: [...f.fields, newField] } : f
    )
  }
}),

// Update a single field's properties
updateField: (formId, fieldId, patch) => set((s) => ({
  forms: s.forms.map(f =>
    f.id === formId
      ? { ...f, fields: f.fields.map(field =>
          field.id === fieldId ? { ...field, ...patch } : field
        )}
      : f
  )
})),

// Remove a field
removeField: (formId, fieldId) => set((s) => ({
  forms: s.forms.map(f =>
    f.id === formId
      ? { ...f, fields: f.fields.filter(field => field.id !== fieldId) }
      : f
  )
})),

// Reorder fields after DnD (receives new ordered array of fields)
reorderFields: (formId, reorderedFields) => set((s) => ({
  forms: s.forms.map(f =>
    f.id === formId
      ? { ...f, fields: reorderedFields.map((field, i) => ({ ...field, order: i })) }
      : f
  )
})),
```

**Default label map** (use this `defaultLabelFor` helper inside the store file):

```js
const defaultLabelFor = (type) => ({
  text: 'Short Answer',
  textarea: 'Long Answer',
  multiple: 'Multiple Choice',
  checkbox: 'Checkboxes',
  scale: 'Rating Scale',
  dropdown: 'Dropdown',
  email: 'Email Address',
  date: 'Date',
  heading: 'Section Heading',
}[type] ?? 'Field')
```

---

## `src/pages/Builder.jsx`

### Responsibilities
- Read `formId` from `useParams()`
- Load the form from the store; if not found, show a "Form not found" message with a link back to `/`
- Manage `selectedFieldId` state (which field is selected / being edited in PropertiesPanel)
- Render the 3-panel layout + top header bar
- Handle Publish and Save Draft button actions

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER BAR (fixed top, full width)                              │
│  ← Back   [form title, editable inline]   [Save Draft][Publish]│
├────────────┬────────────────────────────┬────────────────────────┤
│FieldPalette│     BuilderCanvas          │  PropertiesPanel       │
│  w-64      │     flex-1 overflow-y-auto │  w-72                  │
│  fixed h   │                            │  fixed h               │
└────────────┴────────────────────────────┴────────────────────────┘
```

- Full viewport height layout: `h-screen flex flex-col`
- The 3 panels sit in a `flex-1 flex overflow-hidden` row below the header
- Each side panel is fixed width and independently scrollable
- The canvas is the flex-growing center

### Header bar spec

- **Back arrow** (Lucide `ArrowLeft`) → navigates to `/`
- **Form title**: renders as an `<h1>` that becomes an `<input>` on click (inline editing). On blur, calls `updateForm(formId, { title })`. Show a pencil icon on hover.
- **Status badge**: show current `form.status` using `<Badge>`
- **"Save Draft"** button (secondary): calls `saveDraft(formId)` → shows a success toast `"Draft saved"`
- **"Publish"** button (primary): calls `publishForm(formId)` → shows a success toast `"Form published!"`. Once published, the button label changes to `"Update"` and it calls `updateForm` instead.

### State managed in Builder.jsx

```js
const [selectedFieldId, setSelectedFieldId] = useState(null)
```

Pass `selectedFieldId` and `setSelectedFieldId` down as props to `BuilderCanvas` and `PropertiesPanel`.

---

## `src/components/builder/FieldPalette.jsx`

### Props
```js
{ formId }
```

### Responsibilities
- Render a vertical list of all 9 field types
- Each item is clickable: calls `addField(formId, fieldType)` from the store
- After adding, the new field should be auto-selected (lift the selected field logic or emit a callback — handle this via an `onFieldAdded(fieldId)` callback prop passed from Builder.jsx)

### Field type list (render in this order)

| Icon (Lucide) | Label | type value |
|---|---|---|
| `Type` | Short Answer | `text` |
| `AlignLeft` | Long Answer | `textarea` |
| `CircleDot` | Multiple Choice | `multiple` |
| `CheckSquare` | Checkboxes | `checkbox` |
| `Star` | Rating Scale | `scale` |
| `ChevronDown` | Dropdown | `dropdown` |
| `Mail` | Email | `email` |
| `Calendar` | Date | `date` |
| `Heading` | Section Heading | `heading` |

### Visual design

- Panel has a light gray background (`bg-gray-50`), border-right, full height, overflow-y-auto
- Header: `"Add Fields"` label, small, muted, uppercase, with padding
- Each field type item: icon + label, hover state (light blue background), cursor pointer, rounded, padding
- Clicking adds the field to the canvas immediately

---

## `src/components/builder/BuilderCanvas.jsx`

### Props
```js
{ formId, selectedFieldId, onSelectField }
```

### Responsibilities
- Render the list of fields using `@dnd-kit/sortable` for reordering
- Each field renders as a `<FieldCard />`
- When the canvas is empty, show a drop-zone placeholder
- Handle DnD reorder: on `DragEndEvent`, call `reorderFields(formId, newOrder)`

### DnD Setup (use exactly this pattern)

```jsx
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'

// Inside component:
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
)

function handleDragEnd(event) {
  const { active, over } = event
  if (!over || active.id === over.id) return
  const oldIndex = fields.findIndex(f => f.id === active.id)
  const newIndex = fields.findIndex(f => f.id === over.id)
  const reordered = arrayMove(fields, oldIndex, newIndex)
  reorderFields(formId, reordered)
}
```

### Empty state

When `fields.length === 0`, show a centered dashed-border drop zone:

```
┌─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ┐
        Click fields on the left
         to add them to your form
└─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ┘
```

---

## `src/components/builder/FieldCard.jsx`

### Props
```js
{ field, formId, isSelected, onSelect, onRemove }
```

### Responsibilities
- Wrap itself in `useSortable` from `@dnd-kit/sortable` to be draggable
- Render the correct field preview component based on `field.type`
- Show selected state (border highlight)
- Show drag handle and delete button on hover

### Sortable wrapper pattern

```jsx
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id })

const style = {
  transform: CSS.Transform.toString(transform),
  transition,
  opacity: isDragging ? 0.4 : 1,
}
```

### Card anatomy

```
┌────────────────────────────────────────────────────────┐
│ ≡ (drag handle)  [field preview]          [🗑 delete]  │
└────────────────────────────────────────────────────────┘
```

- Drag handle: Lucide `GripVertical`, apply `{...listeners}` to it only (not the whole card)
- Delete button: Lucide `Trash2`, calls `onRemove(field.id)`, icon-only, danger on hover
- Selected state: `ring-2 ring-blue-500` border around the card
- Clicking anywhere on the card (except drag handle / delete) calls `onSelect(field.id)`
- Background: white, rounded, border, shadow-sm, hover shadow

### Field preview components

The field preview inside the card is a read-only visual representation — it shows what the field will look like to the respondent. It is **not interactive**. Import and render the correct one based on `field.type`:

```js
const FIELD_COMPONENTS = {
  text: TextField,
  textarea: TextareaField,
  multiple: MultipleChoiceField,
  checkbox: CheckboxField,
  scale: ScaleField,
  dropdown: DropdownField,
  email: EmailField,
  date: DateField,
  heading: HeadingField,
}
```

---

## Field Preview Components (`src/components/builder/fields/`)

Each component receives `{ field }` as its only prop and renders a **static, non-interactive preview** of what the field looks like. Use Tailwind for styling. All inputs/controls should have `pointer-events-none` and `opacity-60` to make it clear they're previews, not live inputs.

### `TextField.jsx`
```jsx
<div>
  <label className="...">{field.label}{field.required && <span>*</span>}</label>
  <input type="text" placeholder={field.placeholder || 'Short answer text'} disabled />
</div>
```

### `TextareaField.jsx`
Same pattern but `<textarea rows={3} />`.

### `MultipleChoiceField.jsx`
Render label + a list of radio buttons (one per `field.options` item). If options is empty, show two placeholder options.

### `CheckboxField.jsx`
Same as Multiple Choice but with checkboxes instead of radios.

### `ScaleField.jsx`
Render label + a row of numbered buttons from `field.scaleMin` to `field.scaleMax`. Each is a small square button.

### `DropdownField.jsx`
Render label + a `<select>` with `field.options` as `<option>` elements.

### `EmailField.jsx`
Same as `TextField` but placeholder says `"email@example.com"`.

### `DateField.jsx`
Render label + `<input type="date" disabled />`.

### `HeadingField.jsx`
Render the label as a large heading (`text-xl font-semibold`) and optionally a placeholder description below it. No input. No required marker.

---

## `src/components/builder/PropertiesPanel.jsx`

### Props
```js
{ formId, fieldId }  // fieldId is null when nothing is selected
```

### Responsibilities
- If `fieldId` is null: show a placeholder message `"Select a field to edit its properties"`
- If a field is selected: show the appropriate edit controls for that field type

### Controls to show for ALL field types (except `heading`)

```
Label          [text input]
Placeholder    [text input]     ← hide for: multiple, checkbox, scale, dropdown, heading
Required       [toggle switch]  ← hide for: heading
```

### Controls to show for SPECIFIC types

**`multiple`, `checkbox`, `dropdown`** — Options editor:
```
Options
  Option 1  [x]
  Option 2  [x]
  [+ Add option]
```
- Each option is an editable text input
- `[x]` removes that option
- `[+ Add option]` appends `"Option N"` to the list
- Minimum 1 option must remain (disable remove when only 1 left)

**`scale`** — Scale range editor:
```
Min value  [number input]   (default: 1)
Max value  [number input]   (default: 5)
```
- Min must be ≥ 1, Max must be > Min, Max ≤ 10

**`heading`** — Only show the Label field, labelled as `"Heading text"`. No placeholder, no required toggle.

### Saving changes

Every change in the properties panel calls `updateField(formId, fieldId, patch)` immediately on `onChange` (live update — no save button needed). This keeps the canvas preview in sync in real time.

### Panel design

- White background, border-left, full height, overflow-y-auto, padding
- Header: `"Field Properties"` label, small, muted, uppercase
- Each control group: label above, input below, `mb-4` spacing
- Required toggle: use a styled `<input type="checkbox" />` or a simple toggle button

---

## `useFormStore.js` — Also update `updateForm`

Ensure `updateForm` does a proper shallow merge on the form (not just replace):

```js
updateForm: (id, patch) => set((s) => ({
  forms: s.forms.map(f => f.id === id ? { ...f, ...patch } : f)
})),
```

---

## Form Title / Description Inline Editing (in `Builder.jsx`)

The form title in the header is inline editable:

```jsx
const [editingTitle, setEditingTitle] = useState(false)
const [titleValue, setTitleValue] = useState(form.title)

// Render:
{editingTitle
  ? <input
      autoFocus
      value={titleValue}
      onChange={e => setTitleValue(e.target.value)}
      onBlur={() => {
        updateForm(formId, { title: titleValue.trim() || 'Untitled Form' })
        setEditingTitle(false)
      }}
      onKeyDown={e => e.key === 'Enter' && e.target.blur()}
    />
  : <h1 onClick={() => setEditingTitle(true)}>{form.title}</h1>
}
```

Below the 3-panel area, **do not** add a description editor in Phase 3 — description editing comes in Phase 6 polish.

---

## Publish / Save Draft Logic

```js
// Save Draft
function handleSaveDraft() {
  saveDraft(formId)            // sets status: 'draft'
  toast.success('Draft saved')
}

// Publish
function handlePublish() {
  publishForm(formId)          // sets status: 'published', assigns shareToken if empty
  toast.success('Form published!')
}
```

Ensure `publishForm` in the store assigns a `shareToken` if one doesn't already exist:

```js
publishForm: (id) => set((s) => ({
  forms: s.forms.map(f =>
    f.id === id
      ? { ...f, status: 'published', shareToken: f.shareToken || generateShareToken() }
      : f
  )
})),
```

---

## Git Commit (after all acceptance criteria pass)

```bash
git checkout development
git add .
git commit -m "feat: form builder — DnD canvas, field palette, properties panel, publish/draft (Phase 3)"
```

---

## Acceptance Criteria

- [ ] `/builder/:formId` renders the 3-panel layout with header bar
- [ ] Clicking a field type in the palette adds it to the canvas immediately
- [ ] New fields are auto-selected and their properties shown in the right panel
- [ ] Fields on the canvas can be reordered by drag-and-drop
- [ ] Clicking a field on the canvas selects it and shows its properties
- [ ] Editing the label in the properties panel updates the canvas preview in real time
- [ ] Required toggle works and shows `*` on the canvas preview
- [ ] Multiple choice / checkbox / dropdown: options can be added, edited, and removed
- [ ] Scale field: min/max can be configured and the preview updates
- [ ] Fields can be deleted from the canvas via the trash icon
- [ ] Form title is inline-editable in the header
- [ ] "Save Draft" sets status to `draft` and shows a toast
- [ ] "Publish" sets status to `published` and shows a toast
- [ ] Empty canvas shows the drop-zone placeholder
- [ ] All changes persist on page refresh (Zustand localStorage)
- [ ] No console errors
- [ ] Committed to `development` branch
