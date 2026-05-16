import { useState } from 'react'
import { Check, Copy, Mail, Send } from 'lucide-react'
import { generateId } from '../../lib/idgen.js'
import { useSubmissionStore } from '../../store/useSubmissionStore.js'
import { Modal } from '../ui/Modal.jsx'
import { useToast } from '../ui/Toast.jsx'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ShareModal({ isOpen, onClose, form }) {
  const [copied, setCopied] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [emailError, setEmailError] = useState('')
  const { toast } = useToast()
  const addInvite = useSubmissionStore((state) => state.addInvite)
  const getInvitesByForm = useSubmissionStore((state) => state.getInvitesByForm)
  const invites = useSubmissionStore((state) =>
    state.invites.filter((invite) => invite.formId === form?.id),
  )

  if (!form) return null

  const isPublished = form.status === 'published'
  const publicUrl = `${window.location.origin}/f/${form.shareToken}`
  const displayUrl = isPublished ? publicUrl : 'Publish your form to get a link'

  async function handleCopy() {
    if (!isPublished) return

    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      toast.success('Link copied to clipboard')
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy the link')
    }
  }

  function handleInvite() {
    const email = emailInput.trim().toLowerCase()
    const currentInvites = getInvitesByForm(form.id)

    if (!email) {
      setEmailError('Please enter an email address')
      return
    }

    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address')
      return
    }

    if (currentInvites.some((invite) => invite.email.toLowerCase() === email)) {
      setEmailError('This email has already been invited')
      return
    }

    addInvite({
      id: generateId(),
      formId: form.id,
      email,
      sentAt: new Date().toISOString(),
      openedAt: null,
      submittedAt: null,
    })

    setEmailInput('')
    setEmailError('')
    toast.success(`Invite recorded for ${email}`)
  }

  function inviteStatus(invite) {
    if (invite.submittedAt) return { label: 'Responded', className: 'text-green-600' }
    if (invite.openedAt) return { label: 'Opened', className: 'text-blue-600' }
    return { label: 'Pending', className: 'text-slate-500' }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Form">
      <div className="space-y-6">
        <section>
          <label
            htmlFor="share-link"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Public Link
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="share-link"
              readOnly
              value={displayUrl}
              className="h-10 min-w-0 flex-1 rounded-md border border-slate-300 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="button"
              onClick={handleCopy}
              disabled={!isPublished}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          {!isPublished ? (
            <p className="mt-1.5 text-xs text-amber-600">
              Publish this form to generate a shareable link.
            </p>
          ) : null}
        </section>

        <section>
          <label
            htmlFor="invite-email"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Invite by Email
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="invite-email"
              type="email"
              value={emailInput}
              onChange={(event) => {
                setEmailInput(event.target.value)
                setEmailError('')
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleInvite()
              }}
              placeholder="colleague@example.com"
              className="h-10 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="button"
              onClick={handleInvite}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-slate-900 px-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
          {emailError ? (
            <p className="mt-1.5 text-xs text-red-600">{emailError}</p>
          ) : null}
          <p className="mt-1.5 text-xs text-slate-500">
            Email sending is not available in MVP; invite is recorded for tracking only.
          </p>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-medium text-slate-700">
            Invited ({invites.length})
          </h3>
          {invites.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500">
              No invites recorded yet.
            </p>
          ) : (
            <ul className="max-h-48 divide-y divide-slate-100 overflow-y-auto rounded-md border border-slate-200">
              {invites.map((invite) => {
                const status = inviteStatus(invite)

                return (
                  <li
                    key={invite.id}
                    className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-slate-700">
                      <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="truncate">{invite.email}</span>
                    </span>
                    <span className={`shrink-0 text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </Modal>
  )
}
