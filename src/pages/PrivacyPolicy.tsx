import SEO from '@/components/SEO'
import Breadcrumbs from '@/components/Breadcrumbs'

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-content px-4 py-10">
      <SEO title="Privacy Policy | BarberShop ZA"
           description="How BarberShop ZA collects, uses, and protects your personal information under POPIA."
           canonicalPath="/privacy-policy" />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Privacy Policy' }]} />
      <article className="prose max-w-3xl">
        <h1 className="text-4xl font-display">Privacy Policy</h1>
        <p className="text-sm text-charcoal/60">Last updated: 1 January 2025</p>

        <h2 className="mt-6 text-xl font-display">1. Who we are</h2>
        <p>BarberShop ZA (the "shop", "we", "us") operates from Cape Town CBD and provides barbering services and an online booking platform.</p>

        <h2 className="mt-6 text-xl font-display">2. Information we collect</h2>
        <ul>
          <li>Name, email address, and phone number you provide at signup and booking.</li>
          <li>Booking history, service preferences, and payment confirmations.</li>
          <li>Technical data: IP address, browser type, and pages visited (via Google Analytics, only if you consent).</li>
        </ul>

        <h2 className="mt-6 text-xl font-display">3. Why we collect it</h2>
        <ul>
          <li>To create and manage your bookings.</li>
          <li>To process payments through our payment processor (PayFast).</li>
          <li>To contact you about your bookings or respond to enquiries.</li>
          <li>To meet legal and tax obligations.</li>
        </ul>

        <h2 className="mt-6 text-xl font-display">4. Payment processing</h2>
        <p>Card, EFT, and other payments are processed by <strong>PayFast</strong>, a South African payment processor. We do not store your card details on our servers. PayFast's own privacy policy governs their handling of your payment data.</p>

        <h2 className="mt-6 text-xl font-display">5. Sharing your data</h2>
        <p>We share data only with the third parties necessary to run the service: Supabase (database and authentication), PayFast (payments), and Google (analytics, with consent). We never sell your data.</p>

        <h2 className="mt-6 text-xl font-display">6. Retention</h2>
        <p>Booking and payment records are retained for <strong>5 years</strong> to comply with South African tax law. You may request deletion of marketing-related data at any time.</p>

        <h2 className="mt-6 text-xl font-display">7. Your rights under POPIA</h2>
        <p>As a data subject under the Protection of Personal Information Act, you have the right to access, correct, or delete your personal information, to object to processing, and to lodge a complaint with the Information Regulator (South Africa).</p>

        <h2 className="mt-6 text-xl font-display">8. Cookies</h2>
        <p>We use essential cookies for authentication and, with your consent, analytics cookies from Google Analytics. You may accept or reject analytics at any time via the cookie banner.</p>

        <h2 className="mt-6 text-xl font-display">9. Information Officer</h2>
        <p>Our Information Officer can be reached at <a href="mailto:privacy@yourbarbershop.co.za">privacy@yourbarbershop.co.za</a>.</p>
      </article>
    </div>
  )
}