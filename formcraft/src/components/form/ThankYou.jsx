import { CheckCircle2 } from 'lucide-react'

export default function ThankYou({ message }) {
  return (
    <div className="rounded-xl bg-white p-12 text-center shadow-md">
      <CheckCircle2 className="mx-auto text-green-500" size={64} />
      <h2 className="mt-4 text-center text-2xl font-semibold text-gray-800">
        {message || 'Thank you for your response!'}
      </h2>
      <p className="mt-2 text-center text-gray-500">
        Your response has been recorded.
      </p>
    </div>
  )
}
