import { useState } from 'react'
import { FileText, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../components/ui/Badge.jsx'
import { Button } from '../components/ui/Button.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { Input } from '../components/ui/Input.jsx'
import { Modal } from '../components/ui/Modal.jsx'
import { useFormStore } from '../store/useFormStore.js'
import { useSubmissionStore } from '../store/useSubmissionStore.js'

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function FormCard({ form, responseCount, onDelete }) {
  const navigate = useNavigate()
  const description = form.description?.trim()

  return (
    <article className="flex min-h-64 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-4">
        <Badge variant={form.status === 'published' ? 'published' : 'draft'}>
          {form.status === 'published' ? 'Published' : 'Draft'}
        </Badge>
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-semibold text-gray-900">{form.title}</h2>
        {description ? (
          <p className="mt-2 line-clamp-2 text-sm text-gray-500">{description}</p>
        ) : (
          <p className="mt-2 text-sm italic text-gray-500">No description</p>
        )}
      </div>

      <div className="mt-5 text-xs text-gray-400">
        {responseCount} {responseCount === 1 ? 'response' : 'responses'} &middot;{' '}
        {formatDate(form.createdAt)}
      </div>

      <div className="mt-5 flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/builder/${form.id}`)}
        >
          Open Builder
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/analytics/${form.id}`)}
        >
          Analytics
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="ml-auto px-2.5"
          onClick={() => onDelete(form)}
        >
          <span className="sr-only">Delete {form.title}</span>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </article>
  )
}

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const forms = useFormStore((state) => state.forms)
  const createForm = useFormStore((state) => state.createForm)
  const deleteForm = useFormStore((state) => state.deleteForm)
  const getSubmissionsByForm = useSubmissionStore(
    (state) => state.getSubmissionsByForm,
  )
  const navigate = useNavigate()

  const closeCreateModal = () => {
    setModalOpen(false)
    setTitle('')
  }

  const handleCreate = () => {
    const trimmedTitle = title.trim()

    if (!trimmedTitle) return

    const id = createForm(trimmedTitle)
    closeCreateModal()
    navigate(`/builder/${id}`)
  }

  const handleDelete = () => {
    if (!deleteTarget) return

    deleteForm(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div className="p-8">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold text-slate-950">My Forms</h1>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          + New Form
        </Button>
      </header>

      <main className="mt-8">
        {forms.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No forms yet"
            description="Create your first form to start collecting responses."
            action={
              <Button variant="primary" onClick={() => setModalOpen(true)}>
                + New Form
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                responseCount={getSubmissionsByForm(form.id).length}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </main>

      <Modal isOpen={modalOpen} onClose={closeCreateModal} title="Create form">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            handleCreate()
          }}
        >
          <Input
            label="Form title"
            placeholder="e.g. Customer Feedback Survey"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={closeCreateModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!title.trim()}>
              Create
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete form?"
      >
        <p className="text-sm leading-6 text-slate-600">
          This will permanently delete "{deleteTarget?.title}" and all its
          responses. This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
