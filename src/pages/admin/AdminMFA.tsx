import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useToast } from '@/components/ui/Toast'

export default function AdminMFA() {
  const navigate = useNavigate()
  const toast = useToast()
  const [qr, setQr] = useState('')
  const [factorId, setFactorId] = useState('')
  const [code, setCode] = useState('')

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
      if (error) return toast.push(error.message, 'error')
      setQr(data.totp.qr_code)
      setFactorId(data.id)
    })()
  }, [])

  const verify = async () => {
    const { data: challenge } = await supabase.auth.mfa.challenge({ factorId })
    if (!challenge) return
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code })
    if (error) return toast.push(error.message, 'error')
    toast.push('MFA enabled.', 'success')
    navigate('/admin')
  }

  return (
    <Card className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-display mb-3">Enable two-factor authentication</h1>
      <p className="text-sm text-charcoal/70 mb-4">
        Scan this QR code with Google Authenticator, 1Password, or Authy.
      </p>
      {qr && <img src={qr} alt="MFA QR code" className="mx-auto mb-4" />}
      <Label htmlFor="code">Enter 6-digit code</Label>
      <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} />
      <div className="mt-4">
        <Button onClick={verify}>Verify & enable</Button>
      </div>
    </Card>
  )
}