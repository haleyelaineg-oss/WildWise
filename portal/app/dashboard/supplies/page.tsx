export default function SuppliesPage() {
  return (
    <div className="section section--sm">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Inventory</span>
          <h2 style={{ marginTop: 'var(--space-2)' }}>Supplies</h2>
          <p>Track supplies, medications, and equipment for your rehabilitation work.</p>
        </div>
        <div className="card" style={{ maxWidth: 480 }}>
          <span className="coming-soon" style={{ display: 'inline-flex', marginBottom: 'var(--space-4)' }}>Coming Soon</span>
          <p className="card__body">Supply tracking is under development — check back soon.</p>
        </div>
      </div>
    </div>
  )
}
