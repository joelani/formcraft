export function Input({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  required = false,
  className = '',
}) {
  return (
    <label className={['block', className].join(' ')}>
      {label ? (
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
          {required ? <span className="text-red-600"> *</span> : null}
        </span>
      ) : null}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={[
          'h-10 w-full rounded-md border bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2',
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
            : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100',
        ].join(' ')}
      />
      {error ? <span className="mt-1 block text-sm text-red-600">{error}</span> : null}
    </label>
  )
}
