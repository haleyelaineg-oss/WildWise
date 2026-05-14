'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile } from '@/types'

type Result = Pick<UserProfile, 'id' | 'display_name' | 'license_number' | 'role' | 'approved'>

export default function VerifyForm() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Result[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return

    setLoading(true)
    setError(null)
    setResults(null)

    const supabase = createClient()

    const { data, error: dbError } = await supabase
      .from('profiles')
      .select('id, display_name, license_number, role, approved')
      .in('role', ['licensed_rehabber', 'licensed_vet'])
      .eq('approved', true)
      .or(`display_name.ilike.%${q}%,license_number.ilike.%${q}%`)
      .limit(10)

    setLoading(false)

    if (dbError) {
      setError('Unable to run lookup. Please try again.')
      return
    }

    setResults(data ?? [])
  }

  return (
    <>
      <form onSubmit={handleSearch}>
        <div className="form-group">
          <label htmlFor="verify-query" className="form-label">
            Name or License Number
          </label>
          <input
            id="verify-query"
            type="text"
            className="form-input"
            placeholder="e.g. Jane Smith or MI-2024-0042"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          <span className="form-hint">Search by full name or DNR license number.</span>
        </div>
        <button type="submit" className="btn-primary" disabled={loading || !query.trim()}>
          {loading ? 'Searching…' : 'Look Up'}
        </button>
      </form>

      {error && (
        <p style={{ color: 'var(--color-steel)', marginTop: 'var(--space-6)' }}>{error}</p>
      )}

      {results !== null && (
        <div style={{ marginTop: 'var(--space-8)' }}>
          {results.length === 0 ? (
            <div className="card">
              <h3 className="card__title" style={{ fontSize: 'var(--text-lg)' }}>No results found</h3>
              <p className="card__body">
                No licensed rehabber or vet matched &ldquo;{query}&rdquo;. Double-check the spelling
                or license number, or call the DNR at 1-800-292-7800 to verify manually.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </p>
              {results.map((r) => (
                <div key={r.id} className="card" style={{ padding: 'var(--space-6)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-navy)' }}>
                        {r.display_name ?? 'Name withheld'}
                      </h3>
                      {r.license_number && (
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                          License: {r.license_number}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
                      <span className="badge badge--navy">
                        {r.role === 'licensed_vet' ? 'Licensed Vet' : 'Licensed Rehabber'}
                      </span>
                      {r.approved && (
                        <span className="tag tag--olive">✓ Verified</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
