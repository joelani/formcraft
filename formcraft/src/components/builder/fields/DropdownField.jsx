export default function DropdownField({ field }) {
  const options = field.options?.length ? field.options : ['Option 1', 'Option 2']

  return (
    <div>
      <label className="mb-2 block truncate text-sm font-medium text-text-primary">
        {field.label}
        {field.required ? <span className="ml-1 text-danger">*</span> : null}
      </label>
      <select
        disabled
        className="pointer-events-none h-10 w-full rounded-md border border-border-strong bg-surface-raised px-3 text-sm text-text-secondary opacity-60"
      >
        {options.map((option, index) => (
          <option key={`${option}-${index}`}>{option || `Option ${index + 1}`}</option>
        ))}
      </select>
    </div>
  )
}
