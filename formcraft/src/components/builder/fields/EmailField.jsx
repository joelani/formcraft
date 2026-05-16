export default function EmailField({ field }) {
  return (
    <div>
      <label className="mb-2 block truncate text-sm font-medium text-text-primary">
        {field.label}
        {field.required ? <span className="ml-1 text-danger">*</span> : null}
      </label>
      <input
        type="email"
        placeholder={field.placeholder || 'email@example.com'}
        disabled
        className="pointer-events-none h-10 w-full rounded-md border border-border-strong bg-surface-raised px-3 text-sm opacity-60 placeholder:text-text-muted"
      />
    </div>
  )
}
