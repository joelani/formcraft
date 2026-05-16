import { Monitor, Smartphone, Tablet } from 'lucide-react'

export default function ResponseTable({ form, submissions }) {
  const answerableFields = form.fields.filter((field) => field.type !== 'heading')

  function formatDate(iso) {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatDuration(seconds = 0) {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return remainingSeconds === 0
      ? `${minutes}m`
      : `${minutes}m ${remainingSeconds}s`
  }

  function countAnswered(responses = {}) {
    return answerableFields.filter((field) => {
      const value = responses[field.id]
      return Array.isArray(value)
        ? value.length > 0
        : String(value ?? '').trim() !== ''
    }).length
  }

  function DeviceIcon({ device }) {
    const normalized = String(device ?? '').toLowerCase()

    if (normalized.includes('mobile') || normalized.includes('phone')) {
      return <Smartphone className="h-4 w-4 text-gray-400" />
    }

    if (normalized.includes('tablet')) {
      return <Tablet className="h-4 w-4 text-gray-400" />
    }

    return <Monitor className="h-4 w-4 text-gray-400" />
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-xs font-medium uppercase text-gray-500">
              #
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase text-gray-500">
              Submitted At
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase text-gray-500">
              Duration
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase text-gray-500">
              Device
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase text-gray-500">
              Fields Answered
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {submissions.map((submission, index) => (
            <tr
              key={submission.id ?? `${submission.submittedAt}-${index}`}
              className="transition-colors hover:bg-gray-50"
            >
              <td className="px-4 py-3 text-gray-500">{index + 1}</td>
              <td className="px-4 py-3 text-gray-700">
                {formatDate(submission.submittedAt)}
              </td>
              <td className="px-4 py-3 text-gray-700">
                {formatDuration(submission.duration)}
              </td>
              <td className="px-4 py-3 text-gray-700">
                <span className="inline-flex items-center gap-2 capitalize">
                  <DeviceIcon device={submission.device} />
                  {submission.device || 'unknown'}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-700">
                {countAnswered(submission.responses)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
