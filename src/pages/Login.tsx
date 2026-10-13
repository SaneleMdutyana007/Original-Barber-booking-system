// Login.tsx
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import SEO from '@/components/SEO'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'

const schema = z.object({ email: z.string().email(), password: z.string().min(1) })
type Form = z.infer<typeof schema>

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const loc = useLocation() as any
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async (v: Form) => {
    setLoading(true)
    try {
      await signIn(v.email, v.password)
      toast.push('Signed in.', 'success')
      navigate(loc.state?.from ?? '/dashboard')
    } catch (e) {
      toast.push((e as Error).message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-content px-4 py-16">
      <SEO title="Log In | BarberShop ZA" description="Log in to manage your bookings." canonicalPath="/login" />
      <Card className="mx-auto max-w-md p-8">
        <h1 className="text-3xl font-display mb-6">Log in</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</Button>
        </form>
        <p className="mt-4 text-sm">No account? <Link to="/signup" className="text-amber-500 underline">Create one</Link></p>
      </Card>
    </div>
  )
}