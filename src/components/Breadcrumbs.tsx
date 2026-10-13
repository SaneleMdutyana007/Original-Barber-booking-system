import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface Item { label: string; to?: string }

export default function Breadcrumbs({ items }: { items: Item[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.label,
      item: it.to ? `${window.location.origin}${it.to}` : undefined,
    })),
  }
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-charcoal/60">
          {items.map((it, i) => (
            <li key={i} className="flex items-center gap-1">
              {it.to ? <Link to={it.to} className="hover:text-amber-500">{it.label}</Link>
                     : <span aria-current="page" className="text-charcoal">{it.label}</span>}
              {i < items.length - 1 && <ChevronRight className="h-3 w-3" />}
            </li>
          ))}
        </ol>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  )
}