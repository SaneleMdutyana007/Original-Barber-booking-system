export const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(' ')

export const ZAR = (n: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n)

export const toStorageUrl = (path: string | null | undefined, bucket: string) => {
  if (!path) return null
  const base = import.meta.env.VITE_SUPABASE_URL
  return `${base}/storage/v1/object/public/${bucket}/${path}`
}

export const formatSlot = (iso: string) =>
  new Date(iso).toLocaleString('en-ZA', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })