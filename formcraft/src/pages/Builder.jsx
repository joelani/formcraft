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
  const [mobilePanel, setMobilePanel] = useState('canvas')
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
      <div className="flex min-h-full items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-text-primary">
            Form not found
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            This form may have been deleted or moved.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-[--radius-md] bg-brand-600 px-4 py-2 text-sm font-medium text-text-inverse transition hover:bg-brand-700"
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

  const handleFieldSelect = (fieldId) => {
    setSelectedFieldId(fieldId)
    if (fieldId) setMobilePanel('properties')
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface">
      <header className="flex h-[--builder-header-height] shrink-0 items-center gap-2 overflow-hidden border-b border-border bg-surface px-3 sm:gap-3 sm:px-4">
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 gap-2 px-2"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
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
              className="h-10 w-full max-w-xl rounded-[--radius-md] border border-brand-300 px-3 text-base font-semibold text-text-primary outline-none focus:ring-2 focus:ring-brand-500 sm:text-xl"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingTitle(true)}
              className="flex max-w-full min-w-0 items-center gap-2 rounded-[--radius-md] px-2 py-1 text-left transition hover:bg-surface-overlay focus-visible:outline-none"
            >
              <h1
                className={[
                  'truncate text-base font-semibold sm:text-xl',
                  !form.title || form.title === 'Untitled Form'
                    ? 'text-text-muted'
                    : 'text-text-primary',
                ].join(' ')}
              >
                {form.title || 'Untitled Form'}
              </h1>
              <Pencil className="hidden h-4 w-4 shrink-0 text-text-muted opacity-0 transition group-hover:opacity-100 sm:block" />
            </button>
          )}
        </div>

        <Badge
          variant={form.status === 'published' ? 'published' : 'draft'}
          className="hidden shrink-0 sm:inline-flex"
        >
          {form.status === 'published' ? 'Published' : 'Draft'}
        </Badge>
        <Button
          variant="secondary"
          size="sm"
          className="hidden shrink-0 sm:inline-flex"
          onClick={handleSaveDraft}
        >
          Save Draft
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0 gap-1.5 px-2 sm:px-3"
          onClick={() => setShareOpen(true)}
          aria-label="Share form"
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="shrink-0"
          onClick={handlePublish}
        >
          {form.status === 'published' ? 'Update' : 'Publish'}
        </Button>
      </header>

      <div className="flex border-b border-border bg-surface lg:hidden">
        {['palette', 'canvas', 'properties'].map((panel) => (
          <button
            key={panel}
            type="button"
            onClick={() => setMobilePanel(panel)}
            className={[
              'flex-1 border-b-2 px-2 py-2 text-xs font-medium capitalize transition-colors',
              mobilePanel === panel
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-text-muted',
            ].join(' ')}
          >
            {panel === 'palette'
              ? 'Add Fields'
              : panel === 'canvas'
                ? 'Canvas'
                : 'Properties'}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div
          className={[
            'overflow-y-auto bg-surface-raised lg:block lg:w-[--palette-width] lg:border-r lg:border-border',
            mobilePanel === 'palette' ? 'block w-full' : 'hidden',
          ].join(' ')}
        >
          <FieldPalette
            formId={formId}
            onFieldAdded={(fieldId) => {
              setSelectedFieldId(fieldId)
              setMobilePanel('properties')
            }}
          />
        </div>
        <div
          className={[
            'min-w-0 flex-col overflow-y-auto lg:flex lg:flex-1',
            mobilePanel === 'canvas' ? 'flex flex-1' : 'hidden lg:flex',
          ].join(' ')}
        >
          <BuilderCanvas
            formId={formId}
            selectedFieldId={selectedFieldId}
            onSelectField={handleFieldSelect}
          />
        </div>
        <div
          className={[
            'overflow-y-auto bg-surface lg:block lg:w-[--properties-width] lg:border-l lg:border-border',
            mobilePanel === 'properties' ? 'block w-full' : 'hidden',
          ].join(' ')}
        >
          <PropertiesPanel formId={formId} fieldId={selectedFieldId} />
        </div>
      </div>

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        form={form}
      />
    </div>
  )
}
