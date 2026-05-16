import { GripVertical, Trash2 } from 'lucide-react'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import TextField from './fields/TextField.jsx'
import TextareaField from './fields/TextareaField.jsx'
import MultipleChoiceField from './fields/MultipleChoiceField.jsx'
import CheckboxField from './fields/CheckboxField.jsx'
import ScaleField from './fields/ScaleField.jsx'
import DropdownField from './fields/DropdownField.jsx'
import EmailField from './fields/EmailField.jsx'
import DateField from './fields/DateField.jsx'
import HeadingField from './fields/HeadingField.jsx'

const FIELD_COMPONENTS = {
  text: TextField,
  textarea: TextareaField,
  multiple: MultipleChoiceField,
  checkbox: CheckboxField,
  scale: ScaleField,
  dropdown: DropdownField,
  email: EmailField,
  date: DateField,
  heading: HeadingField,
}

export default function FieldCard({ field, isSelected, onSelect, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })
  const Preview = FIELD_COMPONENTS[field.type] ?? TextField
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(field.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(field.id)
        }
      }}
      tabIndex={0}
      className={[
        'group mx-0 mb-2 flex cursor-pointer gap-2 rounded-[--radius-lg] border bg-surface p-3 shadow-sm transition-all hover:border-border-strong hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:gap-3 sm:p-4',
        isSelected
          ? 'border-brand-300 ring-2 ring-brand-500'
          : 'border-border',
      ].join(' ')}
    >
      <button
        type="button"
        aria-label="Drag field"
        className="mt-0.5 flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-[--radius-md] text-text-disabled opacity-100 transition-colors hover:bg-surface-overlay hover:text-text-muted focus-visible:outline-none sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100"
        onClick={(event) => event.stopPropagation()}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <Preview field={field} />
      </div>

      <button
        type="button"
        aria-label="Delete field"
        onClick={(event) => {
          event.stopPropagation()
          onRemove(field.id)
        }}
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[--radius-md] text-text-muted opacity-100 transition-colors hover:bg-danger-light hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </article>
  )
}
