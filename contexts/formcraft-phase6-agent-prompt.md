# FormCraft — Coding Agent Prompt: Phase 6 (Polish & Extras)

## Context

Phases 1–5 are complete and committed to `development`. The full core product works:
- Dashboard, Form Builder, Public Form View, Analytics all functional
- Zustand stores with localStorage persistence
- Toast system scaffolded in `src/components/ui/Toast.jsx` (may be a stub — implement fully now)

You are implementing **Phase 6: Polish & Extras** — the final phase that makes FormCraft feel complete and production-ready.

---

## Goal

No new pages or routes. This phase improves and connects existing pieces:

1. **Share Modal** — copy public link + simulated email invite from the Builder
2. **Invite Tracking** — mark invites as opened when the public form loads
3. **Toast Notifications** — wire up all existing toast calls that may be stubbed
4. **Responsive Layout** — mobile-friendly public form and dashboard
5. **Empty States** — consistent empty states across all pages
6. **UI Polish** — loading states, transitions, hover effects, small details

---

## Files to Touch

| File | What changes |
|---|---|
| `src/components/ui/Toast.jsx` | Full implementation if stubbed |
| `src/components/builder/ShareModal.jsx` | **New file** — share modal component |
| `src/pages/Builder.jsx` | Add Share button → opens ShareModal |
| `src/pages/PublicForm.jsx` | Mark invite as opened on load |
| `src/pages/Dashboard.jsx` | Polish form cards, confirm empty state |
| `src/pages/Analytics.jsx` | Wire completion rate to invite count |
| `src/components/layout/Sidebar.jsx` | Minor polish |
| `src/store/useSubmissionStore.js` | Verify invite actions work |

---

## 1. Toast System — `src/components/ui/Toast.jsx`

If the Toast component is already fully working, skip this section. If it's a stub, implement it now:

### Full implementation

```jsx
import { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev.slice(-2), { id, message, type }])  // max 3
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container — bottom right */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onRemove }) {
  const icons = {
    success: <CheckCircle2 size={16} className="text-green-500 shrink-0" />,
    error: <AlertCircle size={16} className="text-red-500 shrink-0" />,
    info: <Info size={16} className="text-blue-500 shrink-0" />,
  }
  const borders = {
    success: 'border-green-100',
    error: 'border-red-100',
    info: 'border-blue-100',
  }

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 bg-white border ${borders[toast.type]} rounded-lg shadow-lg px-4 py-3 min-w-64 max-w-sm animate-in`}
    >
      {icons[toast.type]}
      <p className="text-sm text-gray-700 flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-gray-400 hover:text-gray-600 shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
```

### Wire `ToastProvider` into the app

In `src/main.jsx`, wrap the app:

```jsx
import { ToastProvider } from './components/ui/Toast'

<BrowserRouter>
  <ToastProvider>
    <App />
  </ToastProvider>
</BrowserRouter>
```

---

## 2. Share Modal — `src/components/builder/ShareModal.jsx`

**Create this new file.**

### Props
```js
{ isOpen, onClose, form }
```

### What it does
- Shows the public shareable link (read-only, copyable)
- Has a simulated "invite by email" input (stores an `Invite` record — no actual email sent)
- Shows a list of people already invited

### Full spec

```
┌─────────────────────────────────────────────┐
│  Share Form                              [x] │
├─────────────────────────────────────────────┤
│                                             │
│  Public Link                                │
│  ┌──────────────────────────────┐ [Copy]    │
│  │ localhost:5173/f/abc123      │           │
│  └──────────────────────────────┘           │
│  ✓ Link copied!  (shown after copy)         │
│                                             │
│  Invite by Email                            │
│  ┌──────────────────────────────┐ [Send]    │
│  │ colleague@example.com        │           │
│  └──────────────────────────────┘           │
│  Note: "Email sending is not available in   │
│  MVP — invite is recorded for tracking."    │
│                                             │
│  Invited (3)                                │
│  • alice@example.com    Pending             │
│  • bob@example.com      Responded ✓         │
│  • carol@example.com    Pending             │
│                                             │
└─────────────────────────────────────────────┘
```

### Implementation

```jsx
import { useState } from 'react'
import { Copy, Check, Send, Mail } from 'lucide-react'
import Modal from '../ui/Modal'
import { useSubmissionStore } from '../../store/useSubmissionStore'
import { useToast } from '../ui/Toast'
import { generateId } from '../../lib/idgen'

export default function ShareModal({ isOpen, onClose, form }) {
  const [copied, setCopied] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [emailError, setEmailError] = useState('')

  const addInvite = useSubmissionStore(s => s.addInvite)
  const getInvitesByForm = useSubmissionStore(s => s.getInvitesByForm)
  const getSubmissionsByForm = useSubmissionStore(s => s.getSubmissionsByForm)
  const toast = useToast()

  const invites = getInvitesByForm(form.id)
  const submissions = getSubmissionsByForm(form.id)

  const publicUrl = `${window.location.origin}/f/${form.shareToken}`

  function handleCopy() {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  function handleInvite() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailInput.trim()) {
      setEmailError('Please enter an email address')
      return
    }
    if (!emailRegex.test(emailInput.trim())) {
      setEmailError('Please enter a valid email address')
      return
    }
    // Check for duplicate invite
    if (invites.some(i => i.email === emailInput.trim())) {
      setEmailError('This email has already been invited')
      return
    }

    addInvite({
      id: generateId(),
      formId: form.id,
      email: emailInput.trim(),
      sentAt: new Date().toISOString(),
      openedAt: null,
      submittedAt: null,
    })

    setEmailInput('')
    setEmailError('')
    toast.success(`Invite recorded for ${emailInput.trim()}`)
  }

  // Determine invite status
  function getInviteStatus(invite) {
    const hasSubmitted = submissions.some(
      s => s.submittedAt >= invite.sentAt  // rough match — no auth in MVP
    )
    if (invite.submittedAt) return { label: 'Responded', color: 'text-green-600' }
    if (invite.openedAt) return { label: 'Opened', color: 'text-blue-600' }
    return { label: 'Pending', color: 'text-gray-400' }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Form">
      {/* Public link section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Public Link
        </label>
        <div className="flex gap-2">
          <input
            readOnly
            value={form.status === 'published' ? publicUrl : 'Publish your form to get a link'}
            className="flex-1 text-sm border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-600 select-all"
          />
          <button
            onClick={handleCopy}
            disabled={form.status !== 'published'}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        {form.status !== 'published' && (
          <p className="text-xs text-amber-600 mt-1">
            Publish this form to generate a shareable link.
          </p>
        )}
      </div>

      {/* Email invite section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Invite by Email
        </label>
        <div className="flex gap-2">
          <input
            type="email"
            value={emailInput}
            onChange={e => { setEmailInput(e.target.value); setEmailError('') }}
            onKeyDown={e => e.key === 'Enter' && handleInvite()}
            placeholder="colleague@example.com"
            className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleInvite}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
          >
            <Send size={14} />
            Send
          </button>
        </div>
        {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
        <p className="text-xs text-gray-400 mt-1">
          Email sending is not available in MVP — invite is recorded for tracking only.
        </p>
      </div>

      {/* Invite list */}
      {invites.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Invited ({invites.length})
          </h4>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {invites.map(invite => {
              const status = getInviteStatus(invite)
              return (
                <li key={invite.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    <span className="text-gray-700">{invite.email}</span>
                  </div>
                  <span className={`text-xs font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </Modal>
  )
}
```

---

## 3. Wire Share Button into Builder

In `src/pages/Builder.jsx`, add:

```jsx
import ShareModal from '../components/builder/ShareModal'

// State
const [shareOpen, setShareOpen] = useState(false)

// In the header bar, add a Share button next to Save Draft / Publish:
<button
  onClick={() => setShareOpen(true)}
  className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
>
  <Share2 size={15} />
  Share
</button>

// At the bottom of the JSX:
<ShareModal
  isOpen={shareOpen}
  onClose={() => setShareOpen(false)}
  form={form}
/>
```

Import `Share2` from `lucide-react`.

---

## 4. Invite Tracking — Mark Opened on Public Form Load

In `src/pages/PublicForm.jsx`, when the form loads, check if the URL contains a referral param that matches an invite, and mark it as opened.

Since we have no auth, use a simpler approach — mark the most recent un-opened invite for this form as opened when the public page loads:

```jsx
import { useEffect } from 'react'
import { useSubmissionStore } from '../store/useSubmissionStore'

// Inside PublicForm component, after form is confirmed published:
const markInviteOpened = useSubmissionStore(s => s.markInviteOpened)
const getInvitesByForm = useSubmissionStore(s => s.getInvitesByForm)

useEffect(() => {
  if (!form || form.status !== 'published') return
  const invites = getInvitesByForm(form.id)
  const unopened = invites.find(i => !i.openedAt)
  if (unopened) {
    markInviteOpened(unopened.id)
  }
}, [form?.id])
```

Verify `markInviteOpened` is implemented in `useSubmissionStore`:

```js
markInviteOpened: (inviteId) => set((s) => ({
  invites: s.invites.map(i =>
    i.id === inviteId ? { ...i, openedAt: new Date().toISOString() } : i
  )
})),

markInviteSubmitted: (inviteId) => set((s) => ({
  invites: s.invites.map(i =>
    i.id === inviteId ? { ...i, submittedAt: new Date().toISOString() } : i
  )
})),
```

---

## 5. Analytics — Wire Completion Rate to Invites

Update the completion rate stat in `src/pages/Analytics.jsx`:

```js
const invites = getInvitesByForm(formId)
const totalInvited = invites.length

// Completion rate: responses / invited (if invites exist), else show responses / responses
const completionRate = totalInvited === 0
  ? (totalResponses > 0 ? 100 : 0)
  : Math.round((totalResponses / totalInvited) * 100)

// Display
const completionDisplay = totalResponses === 0 ? '—' : `${Math.min(completionRate, 100)}%`
```

Also update the `StatCard` for completion rate to use `completionDisplay`.

---

## 6. Responsive Layout — Public Form

In `src/pages/PublicForm.jsx`, the layout is already `max-w-2xl mx-auto` — ensure it's truly mobile-friendly:

```jsx
// Outer wrapper
<div className="min-h-screen bg-gray-50 py-8 px-4 sm:py-12 sm:px-6">
  <div className="max-w-2xl mx-auto">
    {/* Form header */}
    <div className="mb-6 sm:mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{form.title}</h1>
      {form.description && (
        <p className="text-gray-600 mt-2 text-sm sm:text-base">{form.description}</p>
      )}
    </div>

    {/* Form card */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
      {submitted
        ? <ThankYou message={form.submitMessage} />
        : <FormRenderer form={form} startTime={startTime.current} onSubmitted={() => setSubmitted(true)} />
      }
    </div>
  </div>
</div>
```

---

## 7. Responsive Layout — Dashboard

In `src/pages/Dashboard.jsx`, ensure the form cards grid is responsive:

```jsx
// Already correct from Phase 2, but verify:
<div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
```

Also ensure the "New Form" modal input is full-width on mobile.

---

## 8. Empty States Audit

Check every page and section for missing empty states. Add where missing:

### Dashboard — no forms (already done in Phase 2, verify it works)

### Analytics — no submissions (already done in Phase 5, verify it works)

### Analytics — Response Breakdown with no submissions

The per-question charts section should also show the empty state when no submissions:

```jsx
{submissions.length === 0 ? (
  <EmptyState
    icon={BarChart2}
    title="No responses yet"
    description="Share your form to start collecting responses."
  />
) : (
  // question charts
)}
```

### Builder Canvas — no fields (already done in Phase 3, verify it works)

---

## 9. UI Polish Details

Apply these small improvements across the app:

### Sidebar — active state
Ensure the Dashboard nav link shows an active style (background highlight) when on `/`. Already spec'd in Phase 2 — verify it works correctly.

### Builder header — form title placeholder
If `form.title` is empty or `"Untitled Form"`, show it in muted gray:
```jsx
<h1 className={`... ${!form.title || form.title === 'Untitled Form' ? 'text-gray-400' : 'text-gray-900'}`}>
  {form.title || 'Untitled Form'}
</h1>
```

### Dashboard form cards — description fallback
If `form.description` is empty, show `"No description added"` in italic muted text — verify this is working from Phase 2.

### Form card — published status color
`published` badge: green. `draft` badge: gray. Verify `Badge.jsx` variants are correct.

### Transition consistency
Ensure all interactive elements have `transition-colors` or `transition-shadow` where hover states are defined. Check: form cards, sidebar links, field palette items, builder canvas fields, table rows.

### Focus rings
All inputs, buttons, and interactive elements should have visible focus rings for keyboard accessibility:
```jsx
// Standard: focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
```

---

## 10. `useSubmissionStore` — Final Verify

Ensure all these actions exist and work:

```js
addSubmission(submission)          // ✓ Phase 4
getSubmissionsByForm(formId)       // ✓ Phase 4
addInvite(invite)                  // verify now
getInvitesByForm(formId)           // verify now
markInviteOpened(inviteId)         // verify now
markInviteSubmitted(inviteId)      // verify now
```

If any are missing or stubbed, implement them fully now.

---

## Git Commit (after all acceptance criteria pass)

```bash
git checkout development
git add .
git commit -m "feat: polish — share modal, invite tracking, toasts, responsive layout, empty states (Phase 6)"
```

Then notify the human that all 6 phases are complete and `development` is ready to merge into `main`.

---

## Acceptance Criteria

### Toast System
- [ ] `toast.success()`, `toast.error()`, `toast.info()` all display correctly
- [ ] Toasts auto-dismiss after 3 seconds
- [ ] Max 3 toasts visible at once (oldest drops off)
- [ ] Toasts have a manual close `×` button
- [ ] `ToastProvider` wraps the entire app in `main.jsx`

### Share Modal
- [ ] "Share" button appears in the Builder header
- [ ] Share modal opens with the public link displayed
- [ ] Copying the link shows "Copied!" feedback and a success toast
- [ ] Unpublished forms show a "Publish first" message instead of the link
- [ ] Email invite input validates format and shows errors
- [ ] Duplicate email invites are rejected with an error
- [ ] Submitting an invite adds it to `useSubmissionStore` invites
- [ ] Invited emails list renders with status (Pending / Opened / Responded)

### Invite Tracking
- [ ] Loading a public form URL marks the first un-opened invite as `openedAt`
- [ ] Analytics completion rate reflects invite count when invites exist

### Responsive Layout
- [ ] Public form renders cleanly on mobile (375px width)
- [ ] Dashboard card grid collapses to 1 column on mobile
- [ ] No horizontal overflow on any page at mobile width

### Empty States
- [ ] Dashboard shows empty state when no forms exist
- [ ] Builder canvas shows placeholder when no fields added
- [ ] Analytics shows empty state when no submissions exist

### UI Polish
- [ ] All interactive elements have hover and focus states
- [ ] `transition-colors` applied consistently
- [ ] Sidebar active link is visually highlighted
- [ ] Form title placeholder text is muted when untitled
- [ ] No console errors across all pages
- [ ] Committed to `development` branch
