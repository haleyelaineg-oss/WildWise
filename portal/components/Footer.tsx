import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link href="/" className="nav__logo" style={{ marginBottom: 0 }}>
              <Image
                src="/assets/logos/single-color-logo-white.png"
                alt=""
                width={48}
                height={48}
                className="nav__logo-mark"
                style={{ height: '48px' }}
              />
              <span className="nav__logo-text">
                <span className="wild">WILD</span>
                <span className="wise">WISE</span>
              </span>
            </Link>
            <p className="footer__tagline">
              Connecting Michigan wildlife finders with licensed rehabilitators.
            </p>
            <p className="footer__location">Michigan, USA</p>
          </div>

          <div>
            <p className="footer__col-title">Platform</p>
            <nav className="footer__links" aria-label="Platform links">
              <Link href="/found-an-animal" className="footer__link">Found an Animal</Link>
              <Link href="/learn" className="footer__link">Wildlife Education</Link>
              <Link href="/verify" className="footer__link">Verify a Rehabber</Link>
            </nav>
          </div>

          <div>
            <p className="footer__col-title">For Rehabbers</p>
            <nav className="footer__links" aria-label="Rehabber links">
              <Link href="/login" className="footer__link">Login</Link>
              <Link href="/login?tab=register" className="footer__link">Register</Link>
            </nav>
          </div>

          <div>
            <p className="footer__col-title">About</p>
            <nav className="footer__links" aria-label="About links">
              <Link href="/learn#michigan-system" className="footer__link">Michigan System</Link>
              <a href="mailto:hello@bewildwise.org" className="footer__link">Contact</a>
            </nav>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copy">
            © {new Date().getFullYear()} WildWise. Built for Michigan wildlife.
          </p>
        </div>
      </div>
    </footer>
  )
}
