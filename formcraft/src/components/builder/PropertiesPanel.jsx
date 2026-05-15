import { Plus, X } from 'lucide-react'
import { useFormStore } from '../../store/useFormStore.js'

const OPTION_TYPES = ['multiple', 'checkbox', 'dropdown']
const PLACEHOLDER_TYPES = ['text', 'textarea', 'email']

function ControlGroup({ label, children }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  )
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    />
  )
}

export default function PropertiesPanel({ formId, fieldId }) {
  const form = useFormStore((state) =>
    state.forms.find((item) => item.id === formId),
  )
  const updateField = useFormStore((state) => state.updateField)
  const field = form?.fields.find((item) => item.id === fieldId)

  const patchField = (patch) => {
    if (!field) return
    updateField(formId, field.id, patch)
  }

  const updateOption = (index, value) => {
    const options = [...(field.options ?? [])]
    options[index] = value
    patchField({ options })
  }

  const addOption = () => {
    const options = field.options?.length ? field.options : []
    patchField({ options: [...options, `Option ${options.length + 1}`] })
  }

  const removeOption = (index) => {
    const options = field.options ?? []

    if (options.length <= 1) return

    patchField({ options: options.filter((_, optionIndex) => optionIndex !== index) })
  }

  const updateScaleMin = (value) => {
    const nextMin = Math.max(1, Math.min(Number(value) || 1, 9))
    const currentMax = Number(field.scaleMax ?? 5)
    patchField({
      scaleMin: nextMin,
      scaleMax: Math.max(currentMax, nextMin + 1),
    })
  }

  const updateScaleMax = (value) => {
    const currentMin = Number(field.scaleMin ?? 1)
    const nextMax = Math.min(10, Math.max(Number(value) || currentMin + 1, currentMin + 1))
    patchField({ scaleMax: nextMax })
  }

  return (
    <aside className="h-full w-72 shrink-0 overflow-y-auto border-l border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Field Properties
        </h2>
      </div>

      <div className="p-5">
        {!field ? (
          <p className="text-sm leading-6 text-slate-500">
            Select a field to edit its properties
          </p>
        ) : (
          <>
            <ControlGroup label={field.type === 'heading' ? 'Heading text' : 'Label'}>
              <TextInput
                value={field.label}
                onChange={(event) => patchField({ label: event.target.value })}
              />
            </ControlGroup>

            {PLACEHOLDER_TYPES.includes(field.type) ? (
              <ControlGroup label="Placeholder">
                <TextInput
                  value={field.placeholder ?? ''}
                  onChange={(event) =>
                    patchField({ placeholder: event.target.value })
                  }
                />
              </ControlGroup>
            ) : null}

            {field.type !== 'heading' ? (
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700">Required</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={field.required}
                  onClick={() => patchField({ required: !field.required })}
                  className={[
                    'flex h-6 w-11 items-center rounded-full p-0.5 transition',
                    field.required ? 'bg-blue-600' : 'bg-slate-300',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'h-5 w-5 rounded-full bg-white shadow transition',
                      field.required ? 'translate-x-5' : 'translate-x-0',
                    ].join(' ')}
                  />
                </button>
              </div>
            ) : null}

            {OPTION_TYPES.includes(field.type) ? (
              <div className="mb-5">
                <div className="mb-2 text-sm font-medium text-slate-700">Options</div>
                <div className="space-y-2">
                  {(field.options?.length ? field.options : ['Option 1']).map(
                    (option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <TextInput
                          value={option}
                          onChange={(event) => updateOption(index, event.target.value)}
                        />
                        <button
                          type="button"
                          aria-label={`Remove option ${index + 1}`}
                          disabled={(field.options?.length ?? 1) <= 1}
                          onClick={() => removeOption(index)}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-40"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ),
                  )}
                </div>
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-3 inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4" />
                  Add option
                </button>
              </div>
            ) : null}

            {field.type === 'scale' ? (
              <div className="grid grid-cols-2 gap-3">
                <ControlGroup label="Min value">
                  <TextInput
                    type="number"
                    min={1}
                    max={9}
                    value={field.scaleMin ?? 1}
                    onChange={(event) => updateScaleMin(event.target.value)}
                  />
                </ControlGroup>
                <ControlGroup label="Max value">
                  <TextInput
                    type="number"
                    min={2}
                    max={10}
                    value={field.scaleMax ?? 5}
                    onChange={(event) => updateScaleMax(event.target.value)}
                  />
                </ControlGroup>
              </div>
            ) : null}
          </>
        )}
      </div>
    </aside>
  )
}
