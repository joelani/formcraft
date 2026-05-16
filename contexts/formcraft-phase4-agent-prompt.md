# FormCraft — Coding Agent Prompt: Phase 4 (Public Form View)

## Context

Phases 1, 2, and 3 are complete and committed to `development`. The project now has:
- A working dashboard at `/`
- A fully functional form builder at `/builder/:formId`
- Forms with fields stored in Zustand + localStorage
- `useSubmissionStore` scaffolded with `addSubmission` action
- `PublicForm.jsx` and `FormRenderer.jsx`, `ThankYou.jsx` are currently stubs

You are implementing **Phase 4: the Public Form View** at `/f/:formId`.

---

## Goal

Build the respondent-facing form experience — no login, no sidebar, no app shell. A clean public page where anyone with the link can fill out and submit a form.

The flow:
```
/f/:shareToken or :formId
        ↓
  Form loads (published check)
        ↓
  Respondent fills in fields
        ↓
  Validation on submit
        ↓
  Submission saved to localStorage
        ↓
  Thank-you screen shown
```

---

## Files to Implement

| File | Role |
|---|---|
| `src/pages/PublicForm.jsx` | Route shell — loads form, manages submit state, renders FormRenderer or ThankYou |
| `src/components/form/FormRenderer.jsx` | Renders all fields as live interactive inputs + handles submission |
| `src/components/form/ThankYou.jsx` | Post-submit thank-you screen |

Also update:
| File | What changes |
|---|---|
| `src/store/useSubmissionStore.js` | Verify `addSubmission` is fully implemented — fix if needed |

Do **not** touch any builder components or the AppShell.

---

## `src/pages/PublicForm.jsx`

### Responsibilities
- Read `:formId` from `useParams()`
- Look up the form from `useFormStore` by `id` OR by `shareToken` (support both — the shareable link uses `shareToken`, direct builder preview uses `formId`)
- Handle 3 states: loading, not found / unpublished, form ready
- Track whether the form has been submitted (`submitted` state)
- Record the start time (`Date.now()`) when the form mounts — pass it to `FormRenderer` so submission duration can be calculated
- Render `<FormRenderer>` or `<ThankYou>` based on `submitted` state
- This page has **no `<AppShell>`** — it's completely standalone

### State

```js
const [submitted, setSubmitted] = useState(false)
const startTime = useRef(Date.now())
```

### Form lookup

```js
// Support both shareToken and id lookup
const form = useFormStore(s =>
  s.forms.find(f => f.id === formId || f.shareToken === formId)
)
```

### Guard states

**Form not found or not published:**
```jsx
// Show a clean centered message — not an error page
<div className="min-h-screen flex items-center justify-center">
  <div className="text-center">
    <h1 className="text-2xl font-semibold text-gray-800">Form not found</h1>
    <p className="text-gray-500 mt-2">
      This form doesn't exist or hasn't been published yet.
    </p>
  </div>
</div>
```

Only show the form if `form.status === 'published'`. If the form exists but is a draft, show the "not found" screen (don't reveal draft contents to the public).

### Page layout

No sidebar. Clean centered layout:

```jsx
<div className="min-h-screen bg-gray-50 py-12 px-4">
  <div className="max-w-2xl mx-auto">
    {/* form title + description header */}
    {/* <FormRenderer> or <ThankYou> */}
  </div>
</div>
```

Form header (above `FormRenderer`):
- Form title: `text-3xl font-bold text-gray-900`
- Form description (if set): `text-gray-600 mt-2`
- A subtle divider below

---

## `src/components/form/FormRenderer.jsx`

### Props
```js
{ form, startTime, onSubmitted }
```

### Responsibilities
- Render each field in `form.fields` (sorted by `field.order`) as a **live, interactive input**
- Manage response state for all fields
- Validate on submit (required fields + email format)
- On valid submit: build and save a `Submission` object, call `onSubmitted()`

### Response state

```js
// Key: fieldId, Value: string (text/email/date/scale/dropdown) or string[] (checkbox)
const [responses, setResponses] = useState({})

function updateResponse(fieldId, value) {
  setResponses(prev => ({ ...prev, [fieldId]: value }))
}
```

Initialize with empty defaults — do not pre-fill.

### Field rendering

Sort `form.fields` by `field.order` before rendering. Map each field to its live input component. Each field block follows this pattern:

```jsx
<div key={field.id} className="mb-6">
  {field.type !== 'heading' && (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {field.label}
      {field.required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )}
  {renderField(field)}
  {errors[field.id] && (
    <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>
  )}
</div>
```

### Live input per field type

Implement a `renderField(field)` function that returns the correct input. All inputs use Tailwind classes. Standard input classes: `w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`.

| type | Input to render |
|---|---|
| `text` | `<input type="text">` |
| `textarea` | `<textarea rows={4}>` |
| `email` | `<input type="email">` |
| `date` | `<input type="date">` |
| `dropdown` | `<select>` with `<option>` per `field.options` item + a blank default option |
| `multiple` | Radio group — one `<input type="radio">` per option, name=`field.id` |
| `checkbox` | Checkbox group — one `<input type="checkbox">` per option |
| `scale` | Row of clickable number buttons from `scaleMin` to `scaleMax`, selected one highlighted in blue |
| `heading` | `<h2 className="text-xl font-semibold text-gray-800">{field.label}</h2>` — no input, no label wrapper |

#### Checkbox response handling (array, not string)
```js
function handleCheckbox(fieldId, option, checked) {
  const current = responses[fieldId] || []
  const updated = checked
    ? [...current, option]
    : current.filter(o => o !== option)
  updateResponse(fieldId, updated)
}
```

#### Scale button styling
```jsx
// Selected: bg-blue-600 text-white
// Unselected: bg-white border border-gray-300 text-gray-700 hover:bg-gray-50
<button
  type="button"
  onClick={() => updateResponse(field.id, String(n))}
  className={responses[field.id] === String(n) ? 'selected styles' : 'unselected styles'}
>
  {n}
</button>
```

### Validation

Run on submit, before saving. Build an `errors` object:

```js
const [errors, setErrors] = useState({})

function validate() {
  const newErrors = {}

  form.fields.forEach(field => {
    if (field.type === 'heading') return   // headings are never validated

    const value = responses[field.id]

    // Required check
    if (field.required) {
      const isEmpty = !value || (Array.isArray(value) ? value.length === 0 : value.trim() === '')
      if (isEmpty) {
        newErrors[field.id] = 'This field is required'
      }
    }

    // Email format check
    if (field.type === 'email' && value && value.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value.trim())) {
        newErrors[field.id] = 'Please enter a valid email address'
      }
    }
  })

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}
```

Scroll to the first error field after validation fails:
```js
// After setErrors, scroll to first error
const firstErrorId = Object.keys(newErrors)[0]
document.getElementById(firstErrorId)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
```

Add `id={field.id}` to each field wrapper `<div>` so `scrollIntoView` works.

### Submit handler

```js
async function handleSubmit() {
  if (!validate()) return

  const duration = Math.round((Date.now() - startTime) / 1000)  // seconds

  // Detect device
  const ua = navigator.userAgent
  const device = /Mobi|Android/i.test(ua)
    ? 'mobile'
    : /Tablet|iPad/i.test(ua)
    ? 'tablet'
    : 'desktop'

  const submission = {
    id: generateId(),
    formId: form.id,
    responses,
    submittedAt: new Date().toISOString(),
    duration,
    device,
  }

  addSubmission(submission)
  onSubmitted()
}
```

### Submit button

```jsx
<button
  type="button"
  onClick={handleSubmit}
  className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 transition-colors mt-6"
>
  Submit
</button>
```

Full width, prominent, at the bottom of the form.

---

## `src/components/form/ThankYou.jsx`

### Props
```js
{ message }   // form.submitMessage
```

### Design

Clean centered card:

```
┌─────────────────────────────────────┐
│                                     │
│   ✓  (large green checkmark icon)   │
│                                     │
│   Thank you for your response!      │  ← form.submitMessage
│                                     │
│   Your response has been recorded.  │  ← static subtitle
│                                     │
└─────────────────────────────────────┘
```

- Use Lucide `CheckCircle2` icon, `text-green-500`, size 64
- `message` as `text-2xl font-semibold text-gray-800 mt-4 text-center`
- Subtitle: `text-gray-500 mt-2 text-center`
- White card, rounded-xl, shadow-md, `p-12`, centered on the page
- No navigation links — the respondent is done

```jsx
export default function ThankYou({ message }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-12 text-center">
      <CheckCircle2 className="mx-auto text-green-500" size={64} />
      <h2 className="text-2xl font-semibold text-gray-800 mt-4">
        {message || 'Thank you for your response!'}
      </h2>
      <p className="text-gray-500 mt-2">Your response has been recorded.</p>
    </div>
  )
}
```

---

## `useSubmissionStore.js` — Verify & Fix

Ensure `addSubmission` is fully implemented:

```js
addSubmission: (submission) => set((s) => ({
  submissions: [...s.submissions, submission]
})),

getSubmissionsByForm: (formId) => {
  return get().submissions.filter(s => s.formId === formId)
},
```

Note: `getSubmissionsByForm` uses `get()` not `set()` — it's a selector, not a mutator. Make sure it's implemented this way so it can be called outside of React (e.g. in the analytics page).

Also verify `persist` is active with key `'formcraft-submissions'`.

---

## Shareable Link Format

The public URL uses the form's `shareToken`:

```
http://localhost:5173/f/<shareToken>
```

The `PublicForm.jsx` route already handles both `formId` and `shareToken` lookup:
```js
s.forms.find(f => f.id === formId || f.shareToken === formId)
```

So the route `/f/:formId` works for both — no route changes needed.

---

## What This Phase Does NOT Include

- No authentication
- No edit or delete of responses
- No progress bar or multi-step forms
- No file upload
- The share modal / copy link button is Phase 6

---

## Git Commit (after all acceptance criteria pass)

```bash
git checkout development
git add .
git commit -m "feat: public form view — field rendering, validation, submission, thank-you (Phase 4)"
```

---

## Acceptance Criteria

- [ ] `/f/:formId` and `/f/:shareToken` both load the correct form
- [ ] Draft forms show "Form not found" — published forms render correctly
- [ ] All 9 field types render as live interactive inputs
- [ ] Heading fields render as a visual divider with no input
- [ ] Text, textarea, email, date, dropdown values update response state on change
- [ ] Multiple choice (radio) allows only one selection
- [ ] Checkboxes allow multiple selections and store as an array
- [ ] Scale renders numbered buttons, selected one highlights in blue
- [ ] Required fields show `*` marker
- [ ] Submitting with empty required fields shows inline error messages
- [ ] Email field validates format and shows error for invalid emails
- [ ] Page scrolls to first error field on failed validation
- [ ] Valid submission saves a `Submission` object to `useSubmissionStore`
- [ ] `Submission` has correct `formId`, `responses`, `submittedAt`, `duration`, `device`
- [ ] After submission, `ThankYou` screen renders with `form.submitMessage`
- [ ] Submissions persist on page refresh
- [ ] No `<AppShell>` or sidebar visible on the public form page
- [ ] No console errors
- [ ] Committed to `development` branch
