import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import FormRenderer from '../components/form/FormRenderer.jsx'
import ThankYou from '../components/form/ThankYou.jsx'
import { useFormStore } from '../store/useFormStore.js'
import { useSubmissionStore } from '../store/useSubmissionStore.js'

export default function PublicForm() {
  const { formId } = useParams()
  const [submitted, setSubmitted] = useState(false)
  const startTime = useRef(Date.now())
  const trackedInviteId = useRef(null)
  const form = useFormStore((state) =>
    state.forms.find((item) => item.id === formId || item.shareToken === formId),
  )
  const getInvitesByForm = useSubmissionStore((state) => state.getInvitesByForm)
  const markInviteOpened = useSubmissionStore((state) => state.markInviteOpened)
  const markInviteSubmitted = useSubmissionStore(
    (state) => state.markInviteSubmitted,
  )

  useEffect(() => {
    if (!form || form.status !== 'published') return

    const sessionKey = `formcraft-opened-invite-${form.id}`
    const sessionInviteId = window.sessionStorage.getItem(sessionKey)

    if (sessionInviteId) {
      trackedInviteId.current = sessionInviteId
      return
    }

    const unopenedInvite = getInvitesByForm(form.id).find(
      (invite) => !invite.openedAt,
    )

    if (!unopenedInvite) return

    trackedInviteId.current = unopenedInvite.id
    window.sessionStorage.setItem(sessionKey, unopenedInvite.id)
    markInviteOpened(unopenedInvite.id)
  }, [form, getInvitesByForm, markInviteOpened])

  const handleSubmitted = () => {
    if (trackedInviteId.current) {
      markInviteSubmitted(trackedInviteId.current)
    }

    setSubmitted(true)
  }

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
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 border-b border-gray-200 pb-5 sm:mb-8 sm:pb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {form.title}
          </h1>
          {form.description && (
            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              {form.description}
            </p>
          )}
        </div>

        {submitted ? (
          <ThankYou message={form.submitMessage} />
        ) : (
          <FormRenderer
            form={form}
            startTime={startTime.current}
            onSubmitted={handleSubmitted}
          />
        )}
      </div>
    </div>
  )
}
