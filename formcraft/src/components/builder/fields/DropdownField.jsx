export default function DropdownField({ field }) {
  const options = field.options?.length ? field.options : ['Option 1', 'Option 2']

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-800">
        {field.label}
        {field.required ? <span className="ml-1 text-red-600">*</span> : null}
      </label>
      <select
        disabled
        className="pointer-events-none h-10 w-full rounded-md border border-slate-300 bg-slate-50 px-3 text-sm text-slate-600 opacity-60"
      >
        {options.map((option, index) => (
          <option key={`${option}-${index}`}>{option || `Option ${index + 1}`}</option>
        ))}
      </select>
    </div>
  )
}
