export default function MultipleChoiceField({ field }) {
  const options = field.options?.length ? field.options : ['Option 1', 'Option 2']

  return (
    <div>
      <div className="mb-3 text-sm font-medium text-slate-800">
        {field.label}
        {field.required ? <span className="ml-1 text-red-600">*</span> : null}
      </div>
      <div className="space-y-2">
        {options.map((option, index) => (
          <label
            key={`${option}-${index}`}
            className="pointer-events-none flex items-center gap-2 text-sm text-slate-600 opacity-60"
          >
            <input type="radio" disabled className="h-4 w-4" />
            <span>{option || `Option ${index + 1}`}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
