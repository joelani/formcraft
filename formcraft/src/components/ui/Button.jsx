const variants = {
  primary: 'bg-brand-600 text-text-inverse hover:bg-brand-700 focus-visible:ring-brand-500',
  secondary:
    'bg-surface border border-border text-text-primary hover:bg-surface-overlay focus-visible:ring-brand-500',
  ghost: 'text-text-secondary hover:bg-surface-overlay focus-visible:ring-brand-500',
  danger: 'bg-danger text-text-inverse hover:bg-danger/90 focus-visible:ring-danger',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-[--radius-md]',
  md: 'px-4 py-2 text-sm rounded-[--radius-md]',
  lg: 'px-5 py-2.5 text-base rounded-[--radius-lg]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  children,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}
