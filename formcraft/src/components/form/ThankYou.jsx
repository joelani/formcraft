import { CheckCircle2 } from 'lucide-react'

export default function ThankYou({ message }) {
  return (
    <div className="rounded-[--radius-xl] border border-border bg-surface p-8 text-center shadow-md sm:p-12">
      <CheckCircle2 className="mx-auto text-success" size={64} />
      <h2 className="mt-4 text-center text-2xl font-semibold text-text-primary">
        {message || 'Thank you for your response!'}
      </h2>
      <p className="mt-2 text-center text-text-muted">
        Your response has been recorded.
      </p>
    </div>
  )
}
