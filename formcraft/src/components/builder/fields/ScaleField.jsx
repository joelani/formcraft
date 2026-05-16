export default function ScaleField({ field }) {
  const min = Number(field.scaleMin ?? 1)
  const max = Number(field.scaleMax ?? 5)
  const values = Array.from({ length: max - min + 1 }, (_, index) => min + index)

  return (
    <div>
      <div className="mb-3 truncate text-sm font-medium text-text-primary">
        {field.label}
        {field.required ? <span className="ml-1 text-danger">*</span> : null}
      </div>
      <div className="pointer-events-none flex flex-wrap gap-2 opacity-60">
        {values.map((value) => (
          <button
            key={value}
            type="button"
            disabled
            className="flex h-9 w-9 items-center justify-center rounded-[--radius-md] border border-border-strong bg-surface-raised text-sm text-text-secondary"
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  )
}
