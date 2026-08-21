export const metadata = {
  title: 'Privacy Policy | Dashi',
  description: 'How Dashi handles your data — simple, honest, and minimal.',
}

export default function PrivacyPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#e5e5e5',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '0',
      }}
    >
      <div
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '48px 20px 80px',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            app.get-dashi.com
          </p>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#ffffff',
              margin: '0 0 12px',
              lineHeight: '1.2',
            }}
          >
            Privacy Policy
          </h1>
          <p style={{ fontSize: '14px', color: '#555', margin: 0 }}>
            Last updated: August 2026
          </p>
        </div>

        {/* Intro */}
        <section style={{ marginBottom: '36px' }}>
          <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#bbb', margin: 0 }}>
            Dashi helps you discover bars, restaurants, and experiences in Austin, TX. We built
            it to be useful — not to collect your data. This page explains what little we do
            collect and why.
          </p>
        </section>

        <Divider />

        {/* Section 1 */}
        <Section title="No account required">
          <p>
            You can use Dashi without creating an account, signing in, or providing any personal
            information. We don't ask for your name, email, or phone number.
          </p>
        </Section>

        <Divider />

        {/* Section 2 */}
        <Section title="What we collect">
          <p>
            When you tap a booking link (e.g. OpenTable, Resy), we log a small anonymous event:
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '12px', color: '#aaa' }}>
            <li style={{ marginBottom: '8px' }}>Venue name</li>
            <li style={{ marginBottom: '8px' }}>Booking platform (e.g. "OpenTable")</li>
            <li style={{ marginBottom: '8px' }}>City (e.g. "Austin")</li>
          </ul>
          <p style={{ marginTop: '12px' }}>
            That's it. No user ID, no IP address, no device fingerprint. These clicks are stored
            in Supabase and help us understand which venues people are most interested in so we
            can keep the list fresh and relevant.
          </p>
        </Section>

        <Divider />

        {/* Section 3 */}
        <Section title="What stays on your device">
          <p>
            When you save a venue or create a group, that data is stored in your browser's
            LocalStorage — on your device only. It never leaves your phone or computer, and we
            never see it.
          </p>
          <p style={{ marginTop: '12px' }}>
            If you clear your browser data or switch devices, your saves and groups won't carry
            over.
          </p>
        </Section>

        <Divider />

        {/* Section 4 */}
        <Section title="We don't sell your data">
          <p>
            We don't sell, rent, trade, or share your information with third parties for marketing
            or advertising purposes. Full stop.
          </p>
        </Section>

        <Divider />

        {/* Section 5 */}
        <Section title="Infrastructure">
          <p>
            Dashi is built on{' '}
            <a href="https://supabase.com" style={{ color: '#a78bfa', textDecoration: 'none' }}>
              Supabase
            </a>{' '}
            for backend storage and{' '}
            <a href="https://vercel.com" style={{ color: '#a78bfa', textDecoration: 'none' }}>
              Vercel
            </a>{' '}
            for hosting. Both are reputable platforms with their own privacy policies, which apply
            to their respective services.
          </p>
        </Section>

        <Divider />

        {/* Section 6 */}
        <Section title="Changes to this policy">
          <p>
            If we ever change how we handle data in a meaningful way, we'll update this page and
            the date at the top. We're not expecting to — keeping things simple is the whole point.
          </p>
        </Section>

        <Divider />

        {/* Contact */}
        <Section title="Questions?">
          <p>
            Reach out anytime at{' '}
            <a href="mailto:hello@get-dashi.com" style={{ color: '#a78bfa', textDecoration: 'none' }}>
              hello@get-dashi.com
            </a>
            . We're a small team and we actually read our emails.
          </p>
        </Section>

        {/* Footer */}
        <div style={{ marginTop: '56px', paddingTop: '24px', borderTop: '1px solid #1a1a1a' }}>
          <p style={{ fontSize: '13px', color: '#444', margin: 0 }}>
            © 2026 Dashi · Austin, TX ·{' '}
            <a href="/" style={{ color: '#555', textDecoration: 'none' }}>
              Back to app
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

function Divider() {
  return (
    <hr
      style={{
        border: 'none',
        borderTop: '1px solid #1a1a1a',
        margin: '0 0 32px',
      }}
    />
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section style={{ marginBottom: '32px' }}>
      <h2
        style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#ffffff',
          margin: '0 0 12px',
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontSize: '15px',
          lineHeight: '1.75',
          color: '#999',
          margin: 0,
        }}
      >
        {children}
      </div>
    </section>
  )
}
