const variants = {
  draft: 'bg-slate-100 text-slate-700',
  published: 'bg-green-100 text-green-700',
  default: 'bg-blue-100 text-blue-700',
}

export function Badge({ variant = 'default', children, className = '' }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant] ?? variants.default,
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
