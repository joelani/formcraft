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
        <span className="mb-1 block text-sm font-medium text-text-primary">
          {label}
          {required ? <span className="text-danger"> *</span> : null}
        </span>
      ) : null}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={[
          'w-full border border-border rounded-md bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-surface-overlay disabled:text-text-muted',
          error
            ? 'border-danger focus:ring-danger'
            : '',
        ].join(' ')}
      />
      {error ? <span className="mt-1 block text-xs text-danger">{error}</span> : null}
    </label>
  )
}
