function FieldLabel({ field }) {
  return (
    <label className="mb-2 block truncate text-sm font-medium text-text-primary">
      {field.label}
      {field.required ? <span className="ml-1 text-danger">*</span> : null}
    </label>
  )
}

export default function TextField({ field }) {
  return (
    <div>
      <FieldLabel field={field} />
      <input
        type="text"
        placeholder={field.placeholder || 'Short answer text'}
        disabled
        className="pointer-events-none h-10 w-full rounded-md border border-border-strong bg-surface-raised px-3 text-sm opacity-60 placeholder:text-text-muted"
      />
    </div>
  )
}
