export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 p-8 text-center">
      {Icon ? (
        <div className="mb-4 rounded-full bg-slate-100 p-3 text-slate-500">
          <Icon className="h-6 w-6" />
        </div>
      ) : null}
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-slate-500">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
