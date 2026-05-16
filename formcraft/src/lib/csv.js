function quoteCSVValue(value) {
  const stringValue = value == null ? '' : String(value)
  return `"${stringValue.replace(/"/g, '""')}"`
}

export function exportToCSV(form, submissions) {
  if (submissions.length === 0) return ''

  const fields = (form?.fields ?? [])
    .filter((field) => field.type !== 'heading')
    .sort((a, b) => a.order - b.order)

  const headers = [
    '"Submitted At"',
    '"Duration (s)"',
    '"Device"',
    ...fields.map((field) =>
      quoteCSVValue(field.label || field.id || 'Untitled field'),
    ),
  ]

  const rows = submissions.map((submission) => {
    const base = [
      quoteCSVValue(submission.submittedAt),
      submission.duration ?? 0,
      quoteCSVValue(submission.device),
    ]
    const fieldValues = fields.map((field) => {
      const value = submission.responses?.[field.id]
      const formattedValue = Array.isArray(value) ? value.join('; ') : value
      return quoteCSVValue(formattedValue)
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
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
