import {
  Activity,
  ArrowLeft,
  BarChart2,
  Clock,
  Download,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import QuestionChart from '../components/analytics/QuestionChart.jsx'
import ResponseTable from '../components/analytics/ResponseTable.jsx'
import StatCard from '../components/analytics/StatCard.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { Button } from '../components/ui/Button.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { exportToCSV, downloadCSV } from '../lib/csv.js'
import { useFormStore } from '../store/useFormStore.js'
import { useSubmissionStore } from '../store/useSubmissionStore.js'

function formatDuration(seconds = 0) {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return remainingSeconds === 0
    ? `${minutes}m`
    : `${minutes}m ${remainingSeconds}s`
}

function filenameFor(title) {
  const slug = title
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/gi, '')
    .toLowerCase()

  return `${slug || 'form'}-responses.csv`
}

export default function Analytics() {
  const { formId } = useParams()
  const navigate = useNavigate()
  const form = useFormStore((state) => state.getForm(formId))
  const getSubmissionsByForm = useSubmissionStore(
    (state) => state.getSubmissionsByForm,
  )
  const getInvitesByForm = useSubmissionStore((state) => state.getInvitesByForm)

  if (!form) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Form not found.</p>
      </div>
    )
  }

  const submissions = getSubmissionsByForm(formId)
  const invites = getInvitesByForm(formId)
  const totalResponses = submissions.length
  const totalInvited = invites.length
  const completionRate =
    totalInvited === 0
      ? totalResponses > 0
        ? 100
        : 0
      : Math.round((totalResponses / totalInvited) * 100)
  const completionDisplay =
    totalResponses === 0 ? '—' : `${Math.min(completionRate, 100)}%`
  const avgDuration =
    totalResponses === 0
      ? 0
      : Math.round(
          submissions.reduce(
            (sum, submission) => sum + (submission.duration ?? 0),
            0,
          ) / totalResponses,
        )
  const answerableFields = form.fields
    .filter((field) => field.type !== 'heading')
    .sort((a, b) => a.order - b.order)

  const handleExport = () => {
    const csv = exportToCSV(form, submissions)
    if (!csv) return

    downloadCSV(filenameFor(form.title), csv)
  }

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 gap-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="mt-3 flex min-w-0 flex-wrap items-center gap-3">
            <h1 className="truncate text-3xl font-semibold text-slate-950">
              {form.title}
            </h1>
            <Badge variant={form.status}>
              {form.status === 'published' ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </div>

        <Button
          variant="secondary"
          className="gap-2 self-start sm:self-auto"
          onClick={handleExport}
          disabled={totalResponses === 0}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Responses" value={totalResponses} icon={Users} />
        <StatCard
          label="Completion Rate"
          value={completionDisplay}
          icon={TrendingUp}
        />
        <StatCard
          label="Avg. Time"
          value={totalResponses === 0 ? '—' : formatDuration(avgDuration)}
          icon={Clock}
        />
        <StatCard
          label="Status"
          value={form.status === 'published' ? 'Published' : 'Draft'}
          icon={Activity}
          badge={form.status}
        />
      </div>

      {totalResponses === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={BarChart2}
            title="No responses yet"
            description="Share your form to start collecting responses."
          />
        </div>
      ) : (
        <>
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Response Breakdown
            </h2>
            <div className="space-y-6">
              {answerableFields.map((field) => (
                <QuestionChart
                  key={field.id}
                  field={field}
                  submissions={submissions}
                />
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              All Responses
            </h2>
            <ResponseTable form={form} submissions={submissions} />
          </section>
        </>
      )}
    </div>
  )
}
