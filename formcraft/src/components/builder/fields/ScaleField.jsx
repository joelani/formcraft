export default function ScaleField({ field }) {
  const min = Number(field.scaleMin ?? 1)
  const max = Number(field.scaleMax ?? 5)
  const values = Array.from({ length: max - min + 1 }, (_, index) => min + index)

  return (
    <div>
      <div className="mb-3 text-sm font-medium text-slate-800">
        {field.label}
        {field.required ? <span className="ml-1 text-red-600">*</span> : null}
      </div>
      <div className="pointer-events-none flex flex-wrap gap-2 opacity-60">
        {values.map((value) => (
          <button
            key={value}
            type="button"
            disabled
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-slate-50 text-sm text-slate-700"
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  )
}
