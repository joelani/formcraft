import { useMemo, useState } from 'react'
import { generateId } from '../../lib/idgen.js'
import { useSubmissionStore } from '../../store/useSubmissionStore.js'

const inputClasses =
  'w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500'

export default function FormRenderer({ form, startTime, onSubmitted }) {
  const addSubmission = useSubmissionStore((state) => state.addSubmission)
  const [responses, setResponses] = useState({})
  const [errors, setErrors] = useState({})

  const sortedFields = useMemo(
    () => [...(form.fields || [])].sort((a, b) => a.order - b.order),
    [form.fields],
  )

  function updateResponse(fieldId, value) {
    setResponses((prev) => ({ ...prev, [fieldId]: value }))
    setErrors((prev) => {
      if (!prev[fieldId]) return prev

      const next = { ...prev }
      delete next[fieldId]
      return next
    })
  }

  function handleCheckbox(fieldId, option, checked) {
    const current = responses[fieldId] || []
    const updated = checked
      ? [...current, option]
      : current.filter((item) => item !== option)

    updateResponse(fieldId, updated)
  }

  function validate() {
    const newErrors = {}

    sortedFields.forEach((field) => {
      if (field.type === 'heading') return

      const value = responses[field.id]

      if (field.required) {
        const isEmpty =
          !value ||
          (Array.isArray(value) ? value.length === 0 : value.trim() === '')

        if (isEmpty) {
          newErrors[field.id] = 'This field is required'
        }
      }

      if (field.type === 'email' && value && value.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!emailRegex.test(value.trim())) {
          newErrors[field.id] = 'Please enter a valid email address'
        }
      }
    })

    setErrors(newErrors)

    const firstErrorId = Object.keys(newErrors)[0]
    if (firstErrorId) {
      document
        .getElementById(firstErrorId)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    return Object.keys(newErrors).length === 0
  }

  function detectDevice() {
    const ua = navigator.userAgent

    if (/Tablet|iPad/i.test(ua)) return 'tablet'
    if (/Mobi|Android/i.test(ua)) return 'mobile'

    return 'desktop'
  }

  function handleSubmit() {
    if (!validate()) return

    const submission = {
      id: generateId(),
      formId: form.id,
      responses,
      submittedAt: new Date().toISOString(),
      duration: Math.round((Date.now() - startTime) / 1000),
      device: detectDevice(),
    }

    addSubmission(submission)
    onSubmitted()
  }

  function renderField(field) {
    const value = responses[field.id] || ''
    const options = field.options || []

    switch (field.type) {
      case 'text':
        return (
          <input
            className={inputClasses}
            onChange={(event) => updateResponse(field.id, event.target.value)}
            placeholder={field.placeholder}
            type="text"
            value={value}
          />
        )
      case 'textarea':
        return (
          <textarea
            className={inputClasses}
            onChange={(event) => updateResponse(field.id, event.target.value)}
            placeholder={field.placeholder}
            rows={4}
            value={value}
          />
        )
      case 'email':
        return (
          <input
            className={inputClasses}
            onChange={(event) => updateResponse(field.id, event.target.value)}
            placeholder={field.placeholder}
            type="email"
            value={value}
          />
        )
      case 'date':
        return (
          <input
            className={inputClasses}
            onChange={(event) => updateResponse(field.id, event.target.value)}
            type="date"
            value={value}
          />
        )
      case 'dropdown':
        return (
          <select
            className={inputClasses}
            onChange={(event) => updateResponse(field.id, event.target.value)}
            value={value}
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      case 'multiple':
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <label
                className="flex min-w-0 items-center gap-2 text-sm text-text-secondary"
                key={option}
              >
                <input
                  checked={value === option}
                  className="h-4 w-4 border-border-strong text-brand-600 focus:ring-brand-500"
                  name={field.id}
                  onChange={() => updateResponse(field.id, option)}
                  type="radio"
                />
                <span className="min-w-0 truncate">{option}</span>
              </label>
            ))}
          </div>
        )
      case 'checkbox':
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <label
                className="flex min-w-0 items-center gap-2 text-sm text-text-secondary"
                key={option}
              >
                <input
                  checked={(responses[field.id] || []).includes(option)}
                  className="h-4 w-4 rounded border-border-strong text-brand-600 focus:ring-brand-500"
                  onChange={(event) =>
                    handleCheckbox(field.id, option, event.target.checked)
                  }
                  type="checkbox"
                />
                <span className="min-w-0 truncate">{option}</span>
              </label>
            ))}
          </div>
        )
      case 'scale': {
        const min = Number(field.scaleMin ?? 1)
        const max = Number(field.scaleMax ?? 5)
        const numbers = Array.from(
          { length: Math.max(max - min + 1, 0) },
          (_, index) => min + index,
        )

        return (
          <div className="flex flex-wrap gap-2">
            {numbers.map((number) => {
              const selected = value === String(number)

              return (
                <button
                  className={`h-10 min-w-10 rounded-md px-3 text-sm font-medium transition-colors ${
                    selected
                      ? 'bg-brand-600 text-text-inverse'
                      : 'border border-border-strong bg-surface text-text-secondary hover:bg-surface-raised'
                  }`}
                  key={number}
                  onClick={() => updateResponse(field.id, String(number))}
                  type="button"
                >
                  {number}
                </button>
              )
            })}
          </div>
        )
      }
      case 'heading':
        return (
          <h2 className="text-xl font-semibold text-text-primary">
            {field.label}
          </h2>
        )
      default:
        return null
    }
  }

  return (
    <form className="rounded-xl border border-border bg-surface p-5 shadow-md sm:p-8">
      {sortedFields.map((field) => (
        <div className="mb-6" id={field.id} key={field.id}>
          {field.type !== 'heading' && (
            <label className="mb-1 block text-sm font-medium text-text-secondary">
              {field.label}
              {field.required && <span className="ml-1 text-danger">*</span>}
            </label>
          )}
          {renderField(field)}
          {errors[field.id] && (
            <p className="mt-1 text-sm text-danger">{errors[field.id]}</p>
          )}
        </div>
      ))}

      <button
        className="mt-6 w-full rounded-md bg-brand-600 px-6 py-3 font-medium text-text-inverse transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        onClick={handleSubmit}
        type="button"
      >
        Submit
      </button>
    </form>
  )
}
