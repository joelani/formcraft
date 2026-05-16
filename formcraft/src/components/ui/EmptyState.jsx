export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {Icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50">
          <Icon className="h-6 w-6 text-brand-400" />
        </div>
      ) : null}
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      {description ? (
        <p className="mt-1 max-w-xs text-sm text-text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
