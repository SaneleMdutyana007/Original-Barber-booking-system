export type AppRole = 'admin' | 'client'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'reschedule_requested'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'
export type RequestType = 'reschedule' | 'cancel'
export type RequestStatus = 'pending' | 'approved' | 'rejected'

export interface Profile { id: string; full_name: string; phone: string | null; avatar_url: string | null }
export interface Service { id: string; name: string; slug: string; description: string; duration_minutes: number; price_zar: number; image_path: string | null; image_alt: string; is_active: boolean; sort_order: number }
export interface Barber { id: string; profile_id: string | null; display_name: string; bio: string; specialties: string[]; photo_path: string | null; photo_alt: string; is_active: boolean }
export interface AvailabilitySlot { id: string; barber_id: string; day_of_week: number; start_time: string; end_time: string }
export interface Booking { id: string; client_id: string; barber_id: string; service_id: string; slot_start: string; slot_end: string; status: BookingStatus; payment_status: PaymentStatus; payfast_m_payment_id: string | null; amount_zar: number; notes: string | null; created_at: string; services?: Service; barbers?: Barber }
export interface BookingRequest { id: string; booking_id: string; requested_by: string; request_type: RequestType; requested_slot_start: string | null; reason: string | null; status: RequestStatus; created_at: string; bookings?: Booking }
export interface Review { id: string; booking_id: string; client_id: string; rating: number; comment: string | null; is_published: boolean; created_at: string; profiles?: Profile }
export interface CaseStudy { id: string; title: string; slug: string; client_name: string; service_id: string | null; summary: string; body_html: string; image_path: string | null; image_alt: string; published: boolean; sort_order: number }
export interface FAQ { id: string; question: string; answer: string; category: string; sort_order: number }
export interface PageMeta { path: string; title: string; description: string }