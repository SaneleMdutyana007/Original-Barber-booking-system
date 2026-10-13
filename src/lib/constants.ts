export const SITE = {
  name: 'BarberShop ZA',
  url: import.meta.env.VITE_SITE_URL ?? 'https://yourbarbershop.co.za',
  phone: '+27 21 000 0000',
  email: 'hello@yourbarbershop.co.za',
  address: {
    street: '123 Main Road',
    locality: 'Cape Town',
    region: 'Western Cape',
    postalCode: '8001',
    country: 'ZA',
  },
  geo: { lat: -33.9249, lng: 18.4241 },
  hours: [
    { days: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '08:00', closes: '18:00' },
    { days: ['Saturday'], opens: '08:00', closes: '14:00' },
  ],
  social: {
    facebook: 'https://www.facebook.com/yourbarbershop',
    instagram: 'https://www.instagram.com/yourbarbershop',
  },
}

export const BUCKET = {
  services: 'service-images',
  barbers: 'barber-photos',
  cases: 'case-study-images',
}