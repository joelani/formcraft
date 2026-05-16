export default function DateField({ field }) {
  return (
    <div>
      <label className="mb-2 block truncate text-sm font-medium text-text-primary">
        {field.label}
        {field.required ? <span className="ml-1 text-danger">*</span> : null}
      </label>
      <input
        type="date"
        disabled
        className="pointer-events-none h-10 w-full rounded-[--radius-md] border border-border-strong bg-surface-raised px-3 text-sm text-text-secondary opacity-60"
      />
    </div>
  )
}
