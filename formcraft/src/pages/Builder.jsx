import { useEffect, useState } from 'react'
import { ArrowLeft, Pencil, Share2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BuilderCanvas from '../components/builder/BuilderCanvas.jsx'
import FieldPalette from '../components/builder/FieldPalette.jsx'
import PropertiesPanel from '../components/builder/PropertiesPanel.jsx'
import ShareModal from '../components/builder/ShareModal.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { Button } from '../components/ui/Button.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { useFormStore } from '../store/useFormStore.js'

export default function Builder() {
  const { formId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const form = useFormStore((state) =>
    state.forms.find((item) => item.id === formId),
  )
  const updateForm = useFormStore((state) => state.updateForm)
  const saveDraft = useFormStore((state) => state.saveDraft)
  const publishForm = useFormStore((state) => state.publishForm)
  const [selectedFieldId, setSelectedFieldId] = useState(null)
  const [editingTitle, setEditingTitle] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [titleValue, setTitleValue] = useState(form?.title ?? '')

  useEffect(() => {
    if (!editingTitle) {
      setTitleValue(form?.title ?? '')
    }
  }, [editingTitle, form?.title])

  useEffect(() => {
    if (
      selectedFieldId &&
      !form?.fields.some((field) => field.id === selectedFieldId)
    ) {
      setSelectedFieldId(null)
    }
  }, [form?.fields, selectedFieldId])

  if (!form) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-950">
            Form not found
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            This form may have been deleted or moved.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  const commitTitle = () => {
    updateForm(formId, { title: titleValue.trim() || 'Untitled Form' })
    setEditingTitle(false)
  }

  const handleSaveDraft = () => {
    saveDraft(formId)
    toast.success('Draft saved')
  }

  const handlePublish = () => {
    publishForm(formId)
    toast.success('Form published!')
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-5">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="group min-w-0 flex-1">
          {editingTitle ? (
            <input
              autoFocus
              value={titleValue}
              onChange={(event) => setTitleValue(event.target.value)}
              onBlur={commitTitle}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.currentTarget.blur()
                if (event.key === 'Escape') {
                  setTitleValue(form.title)
                  setEditingTitle(false)
                }
              }}
              className="h-10 w-full max-w-xl rounded-md border border-blue-300 px-3 text-xl font-semibold text-slate-950 outline-none focus:ring-2 focus:ring-blue-100"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingTitle(true)}
              className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1 text-left transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
            >
              <h1
                className={[
                  'truncate text-xl font-semibold',
                  !form.title || form.title === 'Untitled Form'
                    ? 'text-slate-400'
                    : 'text-slate-950',
                ].join(' ')}
              >
                {form.title || 'Untitled Form'}
              </h1>
              <Pencil className="h-4 w-4 shrink-0 text-slate-400 opacity-0 transition group-hover:opacity-100" />
            </button>
          )}
        </div>

        <Badge variant={form.status === 'published' ? 'published' : 'draft'}>
          {form.status === 'published' ? 'Published' : 'Draft'}
        </Badge>
        <Button variant="secondary" size="sm" onClick={handleSaveDraft}>
          Save Draft
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="gap-1.5"
          onClick={() => setShareOpen(true)}
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button variant="primary" size="sm" onClick={handlePublish}>
          {form.status === 'published' ? 'Update' : 'Publish'}
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <FieldPalette formId={formId} onFieldAdded={setSelectedFieldId} />
        <BuilderCanvas
          formId={formId}
          selectedFieldId={selectedFieldId}
          onSelectField={setSelectedFieldId}
        />
        <PropertiesPanel formId={formId} fieldId={selectedFieldId} />
      </div>

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        form={form}
      />
    </div>
  )
}
