export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-raised px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
            <span className="text-sm font-bold text-white">FC</span>
          </div>
          <span className="text-xl font-bold text-text-primary">FormCraft</span>
        </div>

        <div className="rounded-xl border border-border bg-surface p-8 shadow-md">
          <h1 className="text-center text-2xl font-bold text-text-primary">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-center text-sm text-text-muted">
              {subtitle}
            </p>
          ) : null}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
