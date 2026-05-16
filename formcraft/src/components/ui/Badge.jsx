const variants = {
  draft: 'bg-surface-overlay text-text-secondary border border-border',
  published: 'bg-success-light text-success border border-success/20',
  default: 'bg-brand-50 text-brand-600 border border-brand-200',
}

export function Badge({ variant = 'default', children, className = '' }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        variants[variant] ?? variants.default,
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
