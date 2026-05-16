import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const choiceTypes = ['multiple', 'checkbox', 'dropdown']
const textTypes = ['text', 'textarea', 'email', 'date']

function hasResponse(value) {
  return Array.isArray(value) ? value.length > 0 : String(value ?? '').trim() !== ''
}

function SimpleBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((item) => (
            <Cell key={item.name} fill="var(--color-brand-500)" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function ChoiceChart({ field, submissions }) {
  const options = field.options ?? []
  const counts = Object.fromEntries(options.map((option) => [option, 0]))

  submissions
    .map((submission) => submission.responses?.[field.id])
    .filter(hasResponse)
    .forEach((response) => {
      if (Array.isArray(response)) {
        response.forEach((item) => {
          if (counts[item] !== undefined) counts[item] += 1
        })
        return
      }

      if (counts[response] !== undefined) counts[response] += 1
    })

  return (
    <SimpleBarChart
      data={options.map((option) => ({ name: option, count: counts[option] }))}
    />
  )
}

function ScaleChart({ field, submissions }) {
  const min = Number(field.scaleMin ?? 1)
  const max = Number(field.scaleMax ?? 5)
  const scaleResponses = submissions
    .map((submission) => submission.responses?.[field.id])
    .filter(hasResponse)
    .map(Number)

  const avg =
    scaleResponses.length === 0
      ? null
      : (
          scaleResponses.reduce((total, response) => total + response, 0) /
          scaleResponses.length
        ).toFixed(1)

  const chartData = []
  for (let value = min; value <= max; value += 1) {
    chartData.push({
      name: String(value),
      count: scaleResponses.filter((response) => response === value).length,
    })
  }

  return (
    <>
      {avg ? (
        <div className="mb-3">
          <span
            style={{ color: 'var(--color-brand-600)' }}
            className="text-2xl font-bold"
          >
            {avg}
          </span>
          <span className="ml-1 text-sm text-text-muted">/ {max} avg</span>
        </div>
      ) : null}
      <SimpleBarChart data={chartData} />
    </>
  )
}

function TextResponses({ field, submissions }) {
  const textResponses = submissions
    .map((submission) => submission.responses?.[field.id])
    .filter(hasResponse)
    .slice(-5)
    .reverse()

  if (textResponses.length === 0) {
    return <p className="text-sm italic text-text-muted">No responses yet</p>
  }

  return (
    <ul className="space-y-2">
      {textResponses.map((response, index) => (
        <li
          key={`${field.id}-${index}`}
          className="rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text-secondary"
        >
          {String(response)}
        </li>
      ))}
    </ul>
  )
}

export default function QuestionChart({ field, submissions }) {
  const responseCount = submissions.filter((submission) =>
    hasResponse(submission.responses?.[field.id]),
  ).length

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <h3 className="mb-1 truncate text-sm font-medium text-text-secondary">{field.label}</h3>
      <p className="mb-4 text-xs text-text-muted">
        {responseCount} response{responseCount !== 1 ? 's' : ''}
      </p>

      {choiceTypes.includes(field.type) ? (
        <ChoiceChart field={field} submissions={submissions} />
      ) : null}
      {field.type === 'scale' ? (
        <ScaleChart field={field} submissions={submissions} />
      ) : null}
      {textTypes.includes(field.type) ? (
        <TextResponses field={field} submissions={submissions} />
      ) : null}
    </div>
  )
}
