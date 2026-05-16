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
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((item) => (
            <Cell key={item.name} fill="#2563eb" />
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
          <span className="text-2xl font-bold text-blue-600">{avg}</span>
          <span className="ml-1 text-sm text-gray-400">/ {max} avg</span>
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
    return <p className="text-sm italic text-gray-400">No responses yet</p>
  }

  return (
    <ul className="space-y-2">
      {textResponses.map((response, index) => (
        <li
          key={`${field.id}-${index}`}
          className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700"
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
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-1 text-sm font-medium text-gray-700">{field.label}</h3>
      <p className="mb-4 text-xs text-gray-400">
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
