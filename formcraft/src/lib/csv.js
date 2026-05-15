function escapeCSVValue(value) {
  if (Array.isArray(value)) {
    return escapeCSVValue(value.join('; '))
  }

  const stringValue = value == null ? '' : String(value)
  const escaped = stringValue.replaceAll('"', '""')

  if (/[",\r\n]/.test(escaped)) {
    return `"${escaped}"`
  }

  return escaped
}

export function exportToCSV(form, submissions) {
  const fields = form?.fields ?? []
  const headers = [
    'submittedAt',
    'duration',
    'device',
    ...fields.map((field) => field.label || field.id || 'Untitled field'),
  ]

  const rows = submissions.map((submission) => [
    submission.submittedAt,
    submission.duration,
    submission.device,
    ...fields.map((field) => submission.responses?.[field.id] ?? ''),
  ])

  return [headers, ...rows]
    .map((row) => row.map(escapeCSVValue).join(','))
    .join('\n')
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
