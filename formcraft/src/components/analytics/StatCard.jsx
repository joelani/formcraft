import { Badge } from '../ui/Badge.jsx'

export default function StatCard({ label, value, icon: Icon, badge }) {
  return (
    <div className="rounded-[--radius-xl] border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div className="flex items-center gap-1.5 text-xs text-text-muted sm:text-sm">
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-brand-600" /> : null}
        <span className="min-w-0 truncate">{label}</span>
      </div>
      <div className="mt-2 truncate text-2xl font-bold text-text-primary sm:text-3xl">
        {value}
      </div>
      {badge ? (
        <div className="mt-2">
          <Badge variant={badge}>
            {badge === 'published' ? 'Published' : 'Draft'}
          </Badge>
        </div>
      ) : null}
    </div>
  )
}
