# FormCraft — Coding Agent Prompt: Phase 5 (Analytics)

## Context

Phases 1–4 are complete and committed to `development`. The project now has:
- Working dashboard, form builder, and public form view
- Submissions saved to `useSubmissionStore` with `formId`, `responses`, `submittedAt`, `duration`, `device`
- `Analytics.jsx` is a stub at `/analytics/:formId`
- `StatCard.jsx`, `QuestionChart.jsx`, `ResponseTable.jsx` are all stubs

You are implementing **Phase 5: the Analytics Dashboard** at `/analytics/:formId`.

---

## Goal

Build a per-form analytics page that gives form owners a clear picture of how their form is performing:

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: ← Back   "Customer Feedback Survey"   [Export CSV] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │Responses │  │Completion│  │ Avg Time │  │  Status  │  │
│  │    12    │  │   75%    │  │  2m 14s  │  │Published │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
│  Per-question charts (bar charts, avg displays)             │
│                                                             │
│  Response table (all submissions)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Files to Implement

| File | Role |
|---|---|
| `src/pages/Analytics.jsx` | Page shell — loads form + submissions, computes stats, layout |
| `src/components/analytics/StatCard.jsx` | Single KPI stat card |
| `src/components/analytics/QuestionChart.jsx` | Per-question chart (bar or avg) |
| `src/components/analytics/ResponseTable.jsx` | Full submissions table + CSV export |

Also update:
| File | What changes |
|---|---|
| `src/lib/csv.js` | Verify `exportToCSV` and `downloadCSV` are fully implemented — fix if needed |

---

## `src/pages/Analytics.jsx`

### Responsibilities
- Read `formId` from `useParams()`
- Load form from `useFormStore`
- Load submissions from `useSubmissionStore` via `getSubmissionsByForm(formId)`
- Compute all summary stats
- Render the page layout with header, stat cards, question charts, response table
- Handle empty state (no submissions yet)

### Guard states

**Form not found:**
```jsx
<div className="p-8">
  <p className="text-gray-500">Form not found.</p>
</div>
```

**No submissions yet** (form exists but `submissions.length === 0`):
- Still show the stat cards (all zeroed out)
- Replace the charts and table sections with an `<EmptyState>` component:
```jsx
<EmptyState
  icon={BarChart2}
  title="No responses yet"
  description="Share your form to start collecting responses."
/>
```

### Stats to compute

```js
const submissions = getSubmissionsByForm(formId)

// Total responses
const totalResponses = submissions.length

// Completion rate — for MVP all stored submissions are "completed"
// So completion rate = responses / max(responses, 1) * 100 = 100%
// BUT: wire it up properly so it's ready for partial submissions later:
const completionRate = totalResponses === 0
  ? 0
  : Math.round((submissions.length / submissions.length) * 100)
// Note: in Phase 6 when invites are tracked, this becomes:
// Math.round((submissions.length / totalInvitesSent) * 100)
// For now, show "—" or "100%" if responses > 0

// Average completion time
const avgDuration = totalResponses === 0
  ? 0
  : Math.round(submissions.reduce((sum, s) => sum + s.duration, 0) / totalResponses)

// Format duration as "Xm Ys" or "Xs"
function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s === 0 ? `${m}m` : `${m}m ${s}s`
}
```

### Page layout

Wrapped in `<AppShell>` (has sidebar). Clean content area:

```jsx
<div className="p-8 max-w-6xl mx-auto">
  {/* Header */}
  {/* Stat cards row */}
  {/* Question charts section */}
  {/* Response table section */}
</div>
```

### Header bar

```
← Back to Dashboard    "Form Title"    [Export CSV button]
```

- Back arrow (Lucide `ArrowLeft`) navigates to `/`
- Form title as `h1`
- Status `<Badge>` next to the title
- **Export CSV** button (secondary) — triggers CSV download via `exportToCSV` + `downloadCSV` from `src/lib/csv.js`
- If `submissions.length === 0`, disable the Export CSV button

### Stat cards row

```jsx
<div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mt-8">
  <StatCard label="Total Responses" value={totalResponses} icon={Users} />
  <StatCard label="Completion Rate" value={totalResponses === 0 ? '—' : '100%'} icon={TrendingUp} />
  <StatCard label="Avg. Time" value={totalResponses === 0 ? '—' : formatDuration(avgDuration)} icon={Clock} />
  <StatCard label="Status" value={form.status === 'published' ? 'Published' : 'Draft'} icon={Activity} badge={form.status} />
</div>
```

Lucide icons to use: `Users`, `TrendingUp`, `Clock`, `Activity`.

### Question charts section

```jsx
<div className="mt-10">
  <h2 className="text-lg font-semibold text-gray-800 mb-4">Response Breakdown</h2>
  <div className="space-y-6">
    {form.fields
      .filter(f => f.type !== 'heading')   // skip headings — no data
      .sort((a, b) => a.order - b.order)
      .map(field => (
        <QuestionChart
          key={field.id}
          field={field}
          submissions={submissions}
        />
      ))
    }
  </div>
</div>
```

### Response table section

```jsx
<div className="mt-10">
  <h2 className="text-lg font-semibold text-gray-800 mb-4">All Responses</h2>
  <ResponseTable form={form} submissions={submissions} />
</div>
```

---

## `src/components/analytics/StatCard.jsx`

### Props
```js
{ label, value, icon: Icon, badge? }
```

### Design

```
┌───────────────────────────┐
│  🔵 icon    Total         │  ← icon (colored) + label (muted)
│                           │
│       12                  │  ← value (large, bold)
│                           │
│  [badge if provided]      │  ← optional Badge component
└───────────────────────────┘
```

```jsx
export default function StatCard({ label, value, icon: Icon, badge }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Icon size={16} />
        <span>{label}</span>
      </div>
      <div className="mt-3 text-3xl font-bold text-gray-900">{value}</div>
      {badge && (
        <div className="mt-2">
          <Badge variant={badge}>{badge}</Badge>
        </div>
      )}
    </div>
  )
}
```

---

## `src/components/analytics/QuestionChart.jsx`

### Props
```js
{ field, submissions }
```

### Responsibilities

Render different visualisations based on field type:

| Field types | Visualisation |
|---|---|
| `multiple`, `checkbox`, `dropdown` | Recharts `BarChart` — count per option |
| `scale` | Recharts `BarChart` — count per scale value + avg displayed |
| `text`, `textarea`, `email`, `date` | Text response list (last 5 responses) |

### Outer card wrapper (same for all types)

```jsx
<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
  <h3 className="text-sm font-medium text-gray-700 mb-1">{field.label}</h3>
  <p className="text-xs text-gray-400 mb-4">{responseCount} response{responseCount !== 1 ? 's' : ''}</p>
  {/* chart or list */}
</div>
```

### Choice fields — Bar chart (multiple, checkbox, dropdown)

Compute `chartData`:
```js
// For multiple/dropdown: each response is a string matching one option
// For checkbox: each response is a string[] — flatten across all submissions
const allResponses = submissions.map(s => s.responses[field.id]).filter(Boolean)

const counts = {}
field.options.forEach(opt => { counts[opt] = 0 })  // init all options to 0

allResponses.forEach(response => {
  if (Array.isArray(response)) {
    response.forEach(r => { if (counts[r] !== undefined) counts[r]++ })
  } else {
    if (counts[response] !== undefined) counts[response]++
  }
})

const chartData = field.options.map(opt => ({ name: opt, count: counts[opt] }))
```

Recharts bar chart:
```jsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

<ResponsiveContainer width="100%" height={200}>
  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
    <Tooltip />
    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
      {chartData.map((_, i) => (
        <Cell key={i} fill="#6366f1" />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>
```

### Scale field — Bar chart + average

```js
const scaleResponses = submissions
  .map(s => s.responses[field.id])
  .filter(Boolean)
  .map(Number)

const avg = scaleResponses.length === 0
  ? null
  : (scaleResponses.reduce((a, b) => a + b, 0) / scaleResponses.length).toFixed(1)

// Build chart data for each point on the scale
const chartData = []
for (let n = field.scaleMin; n <= field.scaleMax; n++) {
  chartData.push({
    name: String(n),
    count: scaleResponses.filter(r => r === n).length
  })
}
```

Show the avg prominently above the chart:
```jsx
{avg && (
  <div className="mb-3">
    <span className="text-2xl font-bold text-indigo-600">{avg}</span>
    <span className="text-sm text-gray-400 ml-1">/ {field.scaleMax} avg</span>
  </div>
)}
```

Then the same `<BarChart>` pattern as choice fields.

### Text fields — Response list (text, textarea, email, date)

```js
const textResponses = submissions
  .map(s => s.responses[field.id])
  .filter(r => r && String(r).trim() !== '')
  .slice(-5)   // show last 5
  .reverse()   // most recent first
```

```jsx
{textResponses.length === 0 ? (
  <p className="text-sm text-gray-400 italic">No responses yet</p>
) : (
  <ul className="space-y-2">
    {textResponses.map((r, i) => (
      <li key={i} className="text-sm text-gray-700 bg-gray-50 rounded-md px-3 py-2 border border-gray-100">
        {r}
      </li>
    ))}
  </ul>
)}
```

---

## `src/components/analytics/ResponseTable.jsx`

### Props
```js
{ form, submissions }
```

### Responsibilities
- Render a full table of all submissions
- Each row = one submission
- Export CSV button triggers download

### Table columns

| Column | Value |
|---|---|
| # | Row number (1, 2, 3...) |
| Submitted At | Formatted `submittedAt` date + time |
| Duration | Formatted duration (e.g. "1m 23s") |
| Device | `submission.device` with a device icon |
| Responses | Count of answered fields (non-empty responses) |

```jsx
<div className="overflow-x-auto">
  <table className="w-full text-sm text-left">
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">#</th>
        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Submitted At</th>
        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Duration</th>
        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Device</th>
        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Fields Answered</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-100">
      {submissions.map((sub, i) => (
        <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
          <td className="px-4 py-3 text-gray-500">{i + 1}</td>
          <td className="px-4 py-3 text-gray-700">{formatDate(sub.submittedAt)}</td>
          <td className="px-4 py-3 text-gray-700">{formatDuration(sub.duration)}</td>
          <td className="px-4 py-3 text-gray-700 capitalize">{sub.device}</td>
          <td className="px-4 py-3 text-gray-700">{countAnswered(sub.responses)}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

Helper functions (define inside the component):

```js
function formatDate(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s === 0 ? `${m}m` : `${m}m ${s}s`
}

function countAnswered(responses) {
  return Object.values(responses).filter(v =>
    Array.isArray(v) ? v.length > 0 : String(v).trim() !== ''
  ).length
}
```

---

## `src/lib/csv.js` — Verify Full Implementation

Ensure both functions are fully implemented:

```js
export function exportToCSV(form, submissions) {
  if (submissions.length === 0) return ''

  // Build header row: submittedAt, duration, device, then one col per field
  const fieldHeaders = form.fields
    .filter(f => f.type !== 'heading')
    .sort((a, b) => a.order - b.order)
    .map(f => `"${f.label.replace(/"/g, '""')}"`)

  const headers = ['"Submitted At"', '"Duration (s)"', '"Device"', ...fieldHeaders]

  // Build data rows
  const rows = submissions.map(sub => {
    const base = [
      `"${sub.submittedAt}"`,
      sub.duration,
      `"${sub.device}"`,
    ]
    const fieldValues = form.fields
      .filter(f => f.type !== 'heading')
      .sort((a, b) => a.order - b.order)
      .map(f => {
        const val = sub.responses[f.id]
        if (!val) return '""'
        const str = Array.isArray(val) ? val.join('; ') : String(val)
        return `"${str.replace(/"/g, '""')}"`
      })
    return [...base, ...fieldValues].join(',')
  })

  return [headers.join(','), ...rows].join('\n')
}

export function downloadCSV(filename, csvString) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
```

### Wiring the Export CSV button in `Analytics.jsx`

```js
import { exportToCSV, downloadCSV } from '../lib/csv'

function handleExport() {
  const csv = exportToCSV(form, submissions)
  const filename = `${form.title.replace(/\s+/g, '-').toLowerCase()}-responses.csv`
  downloadCSV(filename, csv)
}
```

---

## Sidebar Update

Update `src/components/layout/Sidebar.jsx` — the Analytics page doesn't have a fixed nav link in the sidebar (analytics is per-form, accessed from the dashboard cards). No sidebar changes needed.

---

## Git Commit (after all acceptance criteria pass)

```bash
git checkout development
git add .
git commit -m "feat: analytics dashboard — stat cards, question charts, response table, CSV export (Phase 5)"
```

---

## Acceptance Criteria

- [ ] `/analytics/:formId` loads inside `AppShell` with sidebar
- [ ] Form not found shows a clean message
- [ ] 4 stat cards render: Total Responses, Completion Rate, Avg Time, Status
- [ ] Stat cards show `"—"` when there are no submissions
- [ ] Choice fields (multiple, checkbox, dropdown) show a bar chart with correct counts
- [ ] Scale fields show a bar chart + average value above it
- [ ] Text/textarea/email/date fields show a list of last 5 responses
- [ ] Heading fields are excluded from the breakdown section
- [ ] Response table shows all submissions with correct columns
- [ ] Duration formatted correctly (e.g. "1m 23s" not raw seconds)
- [ ] Empty state shows when no submissions exist
- [ ] Export CSV button downloads a valid `.csv` file
- [ ] CSV includes one column per non-heading field + submittedAt, duration, device
- [ ] CSV checkbox values joined with `"; "` (not raw array)
- [ ] Export CSV button is disabled when no submissions exist
- [ ] No console errors
- [ ] Committed to `development` branch
