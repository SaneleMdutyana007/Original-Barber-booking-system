export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-charcoal/10 ${className}`} />
}