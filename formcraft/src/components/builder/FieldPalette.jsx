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

  const handleAddField = (type) => {
    const fieldId = addField(formId, type)
    onFieldAdded?.(fieldId)
  }

  return (
    <aside className="h-full w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Add Fields
        </h2>
      </div>

      <div className="space-y-1 p-3">
        {FIELD_TYPES.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => handleAddField(type)}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
