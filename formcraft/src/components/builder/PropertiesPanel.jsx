import { Plus, X } from "lucide-react";
import { useFormStore } from "../../store/useFormStore.js";

const OPTION_TYPES = ["multiple", "checkbox", "dropdown"];
const PLACEHOLDER_TYPES = ["text", "textarea", "email"];

function ControlGroup({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-text-primary">
        {label}
      </span>
      {children}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="h-10 w-full min-w-0 rounded-md border border-border-strong bg-surface px-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-transparent focus:ring-2 focus:ring-brand-500"
    />
  );
}

export default function PropertiesPanel({ formId, fieldId }) {
  const form = useFormStore((state) =>
    state.forms.find((item) => item.id === formId),
  );
  const updateFieldLocal = useFormStore((state) => state.updateFieldLocal);
  const updateField = useFormStore((state) => state.updateField);
  const field = form?.fields.find((item) => item.id === fieldId);

  const patchFieldLocal = (patch) => {
    if (!field) return;
    updateFieldLocal(formId, field.id, patch);
  };

  const persistField = async (patch) => {
    if (!field) return;
    await updateField(formId, field.id, patch);
  };

  const updateOption = (index, value) => {
    const options = [...(field.options ?? [])];
    options[index] = value;
    patchFieldLocal({ options });
  };

  const persistOption = (index, value) => {
    const options = [...(field.options ?? [])];
    options[index] = value;
    persistField({ options });
  };

  const addOption = () => {
    const options = field.options?.length ? field.options : [];
    persistField({ options: [...options, `Option ${options.length + 1}`] });
  };

  const removeOption = (index) => {
    const options = field.options ?? [];

    if (options.length <= 1) return;

    persistField({
      options: options.filter((_, optionIndex) => optionIndex !== index),
    });
  };

  const updateScaleMin = (value) => {
    const nextMin = Math.max(1, Math.min(Number(value) || 1, 9));
    const currentMax = Number(field.scaleMax ?? 5);
    patchFieldLocal({
      scaleMin: nextMin,
      scaleMax: Math.max(currentMax, nextMin + 1),
    });
  };

  const updateScaleMax = (value) => {
    const currentMin = Number(field.scaleMin ?? 1);
    const nextMax = Math.min(
      10,
      Math.max(Number(value) || currentMin + 1, currentMin + 1),
    );
    patchFieldLocal({ scaleMax: nextMax });
  };

  return (
    <aside className="h-full overflow-y-auto">
      <div className="sticky top-0 z-10 border-b border-border bg-surface px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Field Properties
        </h2>
      </div>

      <div className="space-y-5 px-4 py-4">
        {!field ? (
          <p className="text-sm leading-6 text-text-muted">
            Select a field to edit its properties
          </p>
        ) : (
          <>
            <ControlGroup
              label={field.type === "heading" ? "Heading text" : "Label"}
            >
              <TextInput
                value={field.label}
                onChange={(event) =>
                  patchFieldLocal({ label: event.target.value })
                }
                onBlur={(event) => persistField({ label: event.target.value })}
              />
            </ControlGroup>

            {PLACEHOLDER_TYPES.includes(field.type) ? (
              <ControlGroup label="Placeholder">
                <TextInput
                  value={field.placeholder ?? ""}
                  onChange={(event) =>
                    patchFieldLocal({ placeholder: event.target.value })
                  }
                  onBlur={(event) =>
                    persistField({ placeholder: event.target.value })
                  }
                />
              </ControlGroup>
            ) : null}

            {field.type !== "heading" ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-text-primary">
                  Required
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={field.required}
                  onClick={() => {
                    const required = !field.required;
                    patchFieldLocal({ required });
                    persistField({ required });
                  }}
                  className={[
                    "flex h-6 w-11 items-center rounded-full p-0.5 transition",
                    field.required ? "bg-brand-600" : "bg-border-strong",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "h-5 w-5 rounded-full bg-surface shadow transition",
                      field.required ? "translate-x-5" : "translate-x-0",
                    ].join(" ")}
                  />
                </button>
              </div>
            ) : null}

            {OPTION_TYPES.includes(field.type) ? (
              <div>
                <div className="mb-2 text-sm font-medium text-text-primary">
                  Options
                </div>
                <div className="space-y-2">
                  {(field.options?.length ? field.options : ["Option 1"]).map(
                    (option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <TextInput
                          value={option}
                          onChange={(event) =>
                            updateOption(index, event.target.value)
                          }
                          onBlur={(event) =>
                            persistOption(index, event.target.value)
                          }
                        />
                        <button
                          type="button"
                          aria-label={`Remove option ${index + 1}`}
                          disabled={(field.options?.length ?? 1) <= 1}
                          onClick={() => removeOption(index)}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-text-muted transition hover:bg-danger-light hover:text-danger disabled:pointer-events-none disabled:opacity-40"
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
                  className="mt-3 inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-brand-600 transition hover:bg-brand-50"
                >
                  <Plus className="h-4 w-4" />
                  Add option
                </button>
              </div>
            ) : null}

            {field.type === "scale" ? (
              <div className="grid grid-cols-2 gap-3">
                <ControlGroup label="Min value">
                  <TextInput
                    type="number"
                    min={1}
                    max={9}
                    value={field.scaleMin ?? 1}
                    onChange={(event) => updateScaleMin(event.target.value)}
                    onBlur={() =>
                      persistField({
                        scaleMin: field.scaleMin ?? 1,
                        scaleMax: field.scaleMax ?? 5,
                      })
                    }
                  />
                </ControlGroup>
                <ControlGroup label="Max value">
                  <TextInput
                    type="number"
                    min={2}
                    max={10}
                    value={field.scaleMax ?? 5}
                    onChange={(event) => updateScaleMax(event.target.value)}
                    onBlur={() => persistField({ scaleMax: field.scaleMax ?? 5 })}
                  />
                </ControlGroup>
              </div>
            ) : null}
          </>
        )}
      </div>
    </aside>
  );
}
