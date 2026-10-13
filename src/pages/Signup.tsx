// Signup.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

const schema = z.object({
  full_name: z.string().min(2),
  phone: z.string().min(9),
  email: z.string().email(),
  password: z.string().min(8),
})
type Form = z.infer<typeof schema>

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async (v: Form) => {
    setLoading(true)
    try {
      await signUp(v.email, v.password, v.full_name, v.phone)
      toast.push('Account created. Check your email to confirm, then log in.', 'success')
      navigate('/login')
    } catch (e) {
      toast.push((e as Error).message, 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="mx-auto max-w-content px-4 py-16">
      <SEO title="Create Account | BarberShop ZA" description="Create your account to book faster." canonicalPath="/signup" />
      <Card className="mx-auto max-w-md p-8">
        <h1 className="text-3xl font-display mb-6">Create your account</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div><Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" {...register('full_name')} />{errors.full_name && <p className="text-xs text-red-600">{errors.full_name.message}</p>}</div>
          <div><Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} />{errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}</div>
          <div><Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />{errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}</div>
          <div><Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} />{errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}</div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</Button>
        </form>
        <p className="mt-4 text-sm">Already have an account? <Link to="/login" className="text-amber-500 underline">Log in</Link></p>
      </Card>
    </div>
  )
}