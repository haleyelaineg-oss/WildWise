export default function VetLogPage() {
  return (
    <div className="section section--sm">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Medical</span>
          <h2 style={{ marginTop: 'var(--space-2)' }}>Vet Log</h2>
          <p>Track veterinary consultations and medical notes for cases in your care.</p>
        </div>
        <div className="card" style={{ maxWidth: 480 }}>
          <span className="coming-soon" style={{ display: 'inline-flex', marginBottom: 'var(--space-4)' }}>Coming Soon</span>
          <p className="card__body">Vet log and medical records are under development — check back soon.</p>
        </div>
      </div>
    </div>
  )
}
