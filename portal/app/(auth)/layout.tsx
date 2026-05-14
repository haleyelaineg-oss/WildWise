import Link from 'next/link'
import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="main-content"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-cream)',
        padding: 'var(--space-8) var(--space-4)',
      }}
    >
      <Link
        href="/"
        className="nav__logo"
        style={{ marginBottom: 'var(--space-8)', textDecoration: 'none' }}
        aria-label="WildWise home"
      >
        <Image
          src="/assets/logos/full-color-circle-logo.png"
          alt=""
          width={56}
          height={56}
          style={{ height: '56px', width: 'auto' }}
        />
        <span className="nav__logo-text" style={{ color: 'var(--color-navy)' }}>
          <span style={{ color: 'var(--color-navy)' }}>WILD</span>
          <span style={{ color: 'var(--color-olive)' }}>WISE</span>
        </span>
      </Link>
      {children}
    </main>
  )
}
