import { Clock } from 'lucide-react'

export default function ResponsePromiseBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
      <Clock className="mt-0.5 h-5 w-5 text-amber-600" aria-hidden />
      <p>
        <strong>Our Promise:</strong> We respond to all booking requests within{' '}
        <strong>2 business hours</strong> (Mon–Sat). Reschedule and cancellation
        requests are reviewed within <strong>1 business hour</strong>.
      </p>
    </div>
  )
}