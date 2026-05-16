import { Badge } from '../ui/Badge.jsx'

export default function StatCard({ label, value, icon: Icon, badge }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {Icon ? <Icon className="h-4 w-4 text-blue-600" /> : null}
        <span>{label}</span>
      </div>
      <div className="mt-3 text-3xl font-bold text-gray-900">{value}</div>
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
