import {
  AlignLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  CircleDot,
  Heading,
  Mail,
  Star,
  Type,
} from 'lucide-react'
import { useFormStore } from '../../store/useFormStore.js'

const FIELD_TYPES = [
  { type: 'text', label: 'Short Answer', icon: Type },
  { type: 'textarea', label: 'Long Answer', icon: AlignLeft },
  { type: 'multiple', label: 'Multiple Choice', icon: CircleDot },
  { type: 'checkbox', label: 'Checkboxes', icon: CheckSquare },
  { type: 'scale', label: 'Rating Scale', icon: Star },
  { type: 'dropdown', label: 'Dropdown', icon: ChevronDown },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'heading', label: 'Section Heading', icon: Heading },
]

export default function FieldPalette({ formId, onFieldAdded }) {
  const addField = useFormStore((state) => state.addField)

  const handleAddField = async (type) => {
    const fieldId = await addField(formId, type)
    onFieldAdded?.(fieldId)
  }

  return (
    <aside className="h-full overflow-y-auto">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Add Fields
        </h2>
      </div>

      <div className="space-y-1 py-2">
        {FIELD_TYPES.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => handleAddField(type)}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-text-secondary transition-colors hover:bg-brand-50 hover:text-brand-600 focus-visible:outline-none"
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="min-w-0 truncate">{label}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
