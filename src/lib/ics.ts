export function downloadICS(opts: {
  title: string; description: string; location: string;
  startISO: string; endISO: string; filename: string
}) {
  const fmt = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BarberShop ZA//EN',
    'BEGIN:VEVENT',
    `UID:${crypto.randomUUID()}`,
    `DTSTAMP:${fmt(new Date().toISOString())}`,
    `DTSTART:${fmt(opts.startISO)}`,
    `DTEND:${fmt(opts.endISO)}`,
    `SUMMARY:${opts.title}`,
    `DESCRIPTION:${opts.description}`,
    `LOCATION:${opts.location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const blob = new Blob([ics], { type: 'text/calendar' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = opts.filename
  a.click()
  URL.revokeObjectURL(a.href)
}