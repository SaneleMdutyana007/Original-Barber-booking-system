import { writeFileSync, mkdirSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const SITE = process.env.VITE_SITE_URL || 'https://yourbarbershop.co.za'
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const statics = ['/', '/services', '/barbers', '/case-studies', '/faqs', '/reviews', '/contact', '/privacy-policy']

const { data: services } = await supabase.from('services').select('slug').eq('is_active', true)
const { data: studies } = await supabase.from('case_studies').select('slug').eq('published', true)

const urls = [
  ...statics.map((p) => ({ loc: SITE + p, priority: p === '/' ? '1.0' : '0.8' })),
  ...(services ?? []).map((s) => ({ loc: `${SITE}/services/${s.slug}`, priority: '0.7' })),
  ...(studies ?? []).map((s) => ({ loc: `${SITE}/case-studies/${s.slug}`, priority: '0.6' })),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`

mkdirSync('public', { recursive: true })
writeFileSync('public/sitemap.xml', xml)
console.log(`sitemap.xml written with ${urls.length} URLs`)