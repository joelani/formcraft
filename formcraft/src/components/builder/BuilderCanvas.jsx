import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { useState } from 'react'
import { useFormStore } from '../../store/useFormStore.js'
import FieldCard from './FieldCard.jsx'

function EmptyCanvas() {
  return (
    <div className="flex min-h-96 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white/70 p-8 text-center">
      <p className="max-w-xs text-sm leading-6 text-slate-500">
        Click fields on the left
        <br />
        to add them to your form
      </p>
    </div>
  )
}

export default function BuilderCanvas({ formId, selectedFieldId, onSelectField }) {
  const [activeId, setActiveId] = useState(null)
  const form = useFormStore((state) =>
    state.forms.find((item) => item.id === formId),
  )
  const removeField = useFormStore((state) => state.removeField)
  const reorderFields = useFormStore((state) => state.reorderFields)
  const fields = [...(form?.fields ?? [])].sort(
    (first, second) => (first.order ?? 0) - (second.order ?? 0),
  )
  const activeField = fields.find((field) => field.id === activeId)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event) {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return
    const oldIndex = fields.findIndex((field) => field.id === active.id)
    const newIndex = fields.findIndex((field) => field.id === over.id)
    const reordered = arrayMove(fields, oldIndex, newIndex)
    reorderFields(formId, reordered)
  }

  const handleRemove = (fieldId) => {
    removeField(formId, fieldId)
    if (fieldId === selectedFieldId) {
      onSelectField(null)
    }
  }

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-slate-100 px-8 py-6">
      <div className="mx-auto max-w-3xl">
        {fields.length === 0 ? (
          <EmptyCanvas />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(event) => setActiveId(event.active.id)}
            onDragCancel={() => setActiveId(null)}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((field) => field.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {fields.map((field) => (
                  <FieldCard
                    key={field.id}
                    field={field}
                    formId={formId}
                    isSelected={selectedFieldId === field.id}
                    onSelect={onSelectField}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeField ? (
                <div className="rounded-lg border border-blue-200 bg-white p-4 shadow-lg">
                  {activeField.label}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </main>
  )
}
