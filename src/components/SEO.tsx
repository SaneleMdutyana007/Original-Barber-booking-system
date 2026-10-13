import { useEffect } from 'react'

interface SEOProps {
  title: string
  description: string
  canonicalPath?: string
  noindex?: boolean
  jsonLd?: object | object[]
}

export default function SEO({
  title,
  description,
  canonicalPath,
  noindex,
  jsonLd,
}: SEOProps) {
  // Serialize jsonLd once per render so the effect below can compare strings
  // instead of object identity (which changes every render when callers pass
  // inline object literals).
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : ''

  useEffect(() => {
    document.title = title

    const setMeta = (
      name: string,
      content: string,
      attr: 'name' | 'property' = 'name'
    ) => {
      let el = document.head.querySelector<HTMLMetaElement>(
        `meta[${attr}="${name}"]`
      )
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    setMeta('description', description)
    setMeta('og:title', title, 'property')
    setMeta('og:description', description, 'property')
    setMeta('og:type', 'website', 'property')

    if (noindex) {
      setMeta('robots', 'noindex,nofollow')
    } else {
      const r = document.head.querySelector('meta[name="robots"]')
      if (r) r.remove()
    }

    // Canonical URL
    const url = `${import.meta.env.VITE_SITE_URL ?? ''}${
      canonicalPath ?? window.location.pathname
    }`
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = url

    // JSON-LD: remove previous blocks injected by this component, then add new ones.
    document
      .querySelectorAll('script[data-seo-jsonld]')
      .forEach((el) => el.remove())

    if (jsonLdString) {
      const parsed = JSON.parse(jsonLdString)
      const blocks = Array.isArray(parsed) ? parsed : [parsed]
      for (const block of blocks) {
        const s = document.createElement('script')
        s.type = 'application/ld+json'
        s.setAttribute('data-seo-jsonld', 'true')
        s.text = JSON.stringify(block)
        document.head.appendChild(s)
      }
    }
  }, [title, description, canonicalPath, noindex, jsonLdString])

  return null
}