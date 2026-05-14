export default function VolunteersPage() {
  return (
    <div className="section section--sm">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Team</span>
          <h2 style={{ marginTop: 'var(--space-2)' }}>Volunteers</h2>
          <p>View and manage volunteers supporting your organization.</p>
        </div>
        <div className="card" style={{ maxWidth: 480 }}>
          <span className="coming-soon" style={{ display: 'inline-flex', marginBottom: 'var(--space-4)' }}>Coming Soon</span>
          <p className="card__body">Volunteer management is under development — check back soon.</p>
        </div>
      </div>
    </div>
  )
}
