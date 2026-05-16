export default function TextareaField({ field }) {
  return (
    <div>
      <label className="mb-2 block truncate text-sm font-medium text-text-primary">
        {field.label}
        {field.required ? <span className="ml-1 text-danger">*</span> : null}
      </label>
      <textarea
        rows={3}
        placeholder={field.placeholder || 'Long answer text'}
        disabled
        className="pointer-events-none w-full resize-none rounded-[--radius-md] border border-border-strong bg-surface-raised px-3 py-2 text-sm opacity-60 placeholder:text-text-muted"
      />
    </div>
  )
}
