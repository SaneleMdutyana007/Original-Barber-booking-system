import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import SEO from '@/components/SEO'
import Breadcrumbs from '@/components/Breadcrumbs'
import { AccordionItem } from '@/components/ui/Accordion'
import type { FAQ } from '@/lib/types'

export default function FAQs() {
  const { data } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => (await supabase.from('faqs').select('*').order('sort_order')).data as FAQ[],
  })

  const grouped = (data ?? []).reduce<Record<string, FAQ[]>>((acc, f) => {
    ;(acc[f.category] ||= []).push(f); return acc
  }, {})

  const faqJsonLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: (data ?? []).map((f) => ({
      '@type': 'Question', name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }

  return (
    <div className="mx-auto max-w-content px-4 py-10">
      <SEO title="Booking FAQs | BarberShop ZA"
           description="Answers about bookings, cancellations, rescheduling, payment, and loyalty rewards at BarberShop ZA."
           canonicalPath="/faqs" jsonLd={faqJsonLd} />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'FAQs' }]} />
      <h1 className="text-4xl font-display mb-6">Frequently Asked Questions</h1>
      {Object.entries(grouped).map(([cat, list]) => (
        <section key={cat} className="mb-8">
          <h2 className="text-2xl font-display mb-2">{cat}</h2>
          <div>{list.map((f) => <AccordionItem key={f.id} title={f.question}>{f.answer}</AccordionItem>)}</div>
        </section>
      ))}
    </div>
  )
}