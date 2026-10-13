import { z } from 'zod'

export const signupSchema = z.object({
  full_name: z.string().min(2, 'Please enter your full name'),
  phone: z.string().min(9, 'Enter a valid SA phone number'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const bookingSchema = z.object({
  service_id: z.string().uuid(),
  barber_id: z.string().uuid(),
  slot_start: z.string(),
})

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(600).optional(),
})