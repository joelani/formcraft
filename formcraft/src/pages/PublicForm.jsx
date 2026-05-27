import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import FormRenderer from '../components/form/FormRenderer.jsx'
import ThankYou from '../components/form/ThankYou.jsx'
import { useFormStore } from '../store/useFormStore.js'
import { useSubmissionStore } from '../store/useSubmissionStore.js'

export default function PublicForm() {
  const { formId } = useParams()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const startTime = useRef(Date.now())
  const trackedInviteId = useRef(null)
  const fetchForm = useFormStore((state) => state.fetchForm)
  const getInvitesByForm = useSubmissionStore((state) => state.getInvitesByForm)
  const markInviteOpened = useSubmissionStore((state) => state.markInviteOpened)
  const markInviteSubmitted = useSubmissionStore(
    (state) => state.markInviteSubmitted,
  )

  useEffect(() => {
    const root = document.documentElement
    const wasDark = root.classList.contains('dark')

    root.classList.remove('dark')

    return () => {
      if (wasDark) {
        root.classList.add('dark')
      }
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadForm() {
      setLoading(true)
      const data = await fetchForm(formId)

      if (!cancelled) {
        setForm(data)
        setLoading(false)
      }
    }

    loadForm()

    return () => {
      cancelled = true
    }
  }, [fetchForm, formId])

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-raised">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  if (!form || form.status !== 'published') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-raised px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-text-primary">
            Form not found
          </h1>
          <p className="mt-2 text-text-muted">
            This form doesn't exist or hasn't been published yet.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-raised px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 border-b border-border pb-5 sm:mb-8 sm:pb-6">
          <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
            {form.title}
          </h1>
          {form.description && (
            <p className="mt-2 text-sm text-text-secondary sm:text-base">
              {form.description}
            </p>
          )}
        </div>

        {submitted ? (
          <ThankYou message={form.submit_message} />
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
