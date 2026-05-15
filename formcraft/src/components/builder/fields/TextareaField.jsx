export default function TextareaField({ field }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-800">
        {field.label}
        {field.required ? <span className="ml-1 text-red-600">*</span> : null}
      </label>
      <textarea
        rows={3}
        placeholder={field.placeholder || 'Long answer text'}
        disabled
        className="pointer-events-none w-full resize-none rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm opacity-60 placeholder:text-slate-400"
      />
    </div>
  )
}
