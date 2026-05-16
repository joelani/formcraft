export default function CheckboxField({ field }) {
  const options = field.options?.length ? field.options : ['Option 1', 'Option 2']

  return (
    <div>
      <div className="mb-3 truncate text-sm font-medium text-text-primary">
        {field.label}
        {field.required ? <span className="ml-1 text-danger">*</span> : null}
      </div>
      <div className="space-y-2">
        {options.map((option, index) => (
          <label
            key={`${option}-${index}`}
            className="pointer-events-none flex min-w-0 items-center gap-2 text-sm text-text-secondary opacity-60"
          >
            <input type="checkbox" disabled className="h-4 w-4 rounded" />
            <span className="min-w-0 truncate">{option || `Option ${index + 1}`}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
