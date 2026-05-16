import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import FormRenderer from '../components/form/FormRenderer.jsx'
import ThankYou from '../components/form/ThankYou.jsx'
import { useFormStore } from '../store/useFormStore.js'

export default function PublicForm() {
  const { formId } = useParams()
  const [submitted, setSubmitted] = useState(false)
  const startTime = useRef(Date.now())
  const form = useFormStore((state) =>
    state.forms.find((item) => item.id === formId || item.shareToken === formId),
  )

  if (!form || form.status !== 'published') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Form not found
          </h1>
          <p className="mt-2 text-gray-500">
            This form doesn't exist or hasn't been published yet.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
          {form.description && (
            <p className="mt-2 text-gray-600">{form.description}</p>
          )}
        </div>

        {submitted ? (
          <ThankYou message={form.submitMessage} />
        ) : (
          <FormRenderer
            form={form}
            startTime={startTime.current}
            onSubmitted={() => setSubmitted(true)}
          />
        )}
      </div>
    </div>
  )
}
