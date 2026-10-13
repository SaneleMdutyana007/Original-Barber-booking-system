import { createHash } from 'node:crypto'

const enc = (v: string) =>
  encodeURIComponent(v).replace(/%20/g, '+').replace(/[!'()*]/g, (c) =>
    '%' + c.charCodeAt(0).toString(16).toUpperCase()
  )

export function buildSignableString(fields: Record<string, string>): string {
  return Object.keys(fields)
    .filter((k) => k !== 'signature' && fields[k] !== '' && fields[k] != null)
    .sort()
    .map((k) => `${k}=${enc(String(fields[k]))}`)
    .join('&')
}

function md5Hex(input: string): string {
  return createHash('md5').update(input).digest('hex')
}

export async function signPayfastData(
  fields: Record<string, string>,
  passphrase: string
): Promise<string> {
  const base = buildSignableString(fields)
  const withPass = passphrase ? `${base}&passphrase=${enc(passphrase)}` : base
  return md5Hex(withPass)
}

export async function verifyPayfastSource(ip: string): Promise<boolean> {
  if (!ip) return false
  try {
    const res = await fetch(`https://dns.google/resolve?name=${ip}.in-addr.arpa&type=PTR`)
    const json = await res.json()
    const answers = json?.Answer ?? []
    return answers.some((a: { data: string }) => /\.payfast\.co\.za\.?$/i.test(a.data))
  } catch {
    return false
  }
}