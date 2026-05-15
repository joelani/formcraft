export default function DateField({ field }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-800">
        {field.label}
        {field.required ? <span className="ml-1 text-red-600">*</span> : null}
      </label>
      <input
        type="date"
        disabled
        className="pointer-events-none h-10 w-full rounded-md border border-slate-300 bg-slate-50 px-3 text-sm text-slate-600 opacity-60"
      />
    </div>
  )
}
