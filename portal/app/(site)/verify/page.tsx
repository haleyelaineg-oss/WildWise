import type { Metadata } from 'next'
import VerifyForm from './VerifyForm'

export const metadata: Metadata = {
  title: 'Verify a Rehabber — WildWise',
  description:
    'Look up a Michigan wildlife rehabilitator by name or license number to confirm their credentials.',
}

export default function VerifyPage() {
  return (
    <>
      <div className="page-hero">
        <div className="container page-hero__inner">
          <span className="section-label">Credential Lookup</span>
          <h1>Verify a Licensed Rehabber</h1>
          <p className="lead">
            Confirm that a wildlife rehabilitator holds a valid DNR permit before
            transferring an animal to their care.
          </p>
        </div>
      </div>

      <section className="section section--white">
        <div className="container" style={{ maxWidth: 'var(--container-md)' }}>
          <VerifyForm />

          <div className="pull-quote" style={{ marginTop: 'var(--space-12)' }}>
            <p>
              Only transfer wildlife to rehabilitators listed here or those you reached
              through the &ldquo;Found an Animal&rdquo; tool. Never hand off an animal to someone
              who cannot provide a verified license number.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
