'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types'

const ROLES: { value: UserRole; label: string; description: string; requiresApproval?: 'admin' | 'rehabber' }[] = [
  {
    value: 'licensed_rehabber',
    label: 'Licensed Rehabilitator',
    description: 'Hold a valid DNR Wildlife Rehabilitation Permit',
    requiresApproval: 'admin',
  },
  {
    value: 'licensed_vet',
    label: 'Licensed Veterinarian',
    description: 'Partner vet providing medical care to wildlife',
    requiresApproval: 'admin',
  },
  {
    value: 'sub_permittee',
    label: 'Sub-permittee',
    description: 'Working under a licensed rehabber\'s permit',
    requiresApproval: 'rehabber',
  },
  {
    value: 'volunteer',
    label: 'General Volunteer',
    description: 'Supporting a rehabilitation organization',
  },
  {
    value: 'transport_volunteer',
    label: 'Transport Volunteer',
    description: 'Transporting animals from finders to rehabbers',
  },
]

export default function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; name?: string; phone?: string }>
}) {
  const { tab, name: prefillName, phone: prefillPhone } = use(searchParams)
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>(
    tab === 'register' ? 'register' : 'signin'
  )

  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState(prefillName ?? '')
  const [phone, setPhone] = useState(prefillPhone ?? '')
  const [role, setRole] = useState<UserRole>('licensed_rehabber')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const selectedRole = ROLES.find((r) => r.value === role)

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          role,
          license_number: licenseNumber || null,
          phone: phone.trim() || null,
        },
      },
    })

    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    if (data.user && !data.session) {
      setSuccessMsg('Check your email to confirm your account. Once confirmed, your account will be reviewed.')
      return
    }

    router.push('/dashboard')
  }

  if (successMsg) {
    return (
      <div className="card" style={{ maxWidth: 480, width: '100%' }}>
        <h2 className="card__title">Application submitted</h2>
        <p className="card__body" style={{ marginTop: 'var(--space-3)' }}>{successMsg}</p>
        <a href="/" className="btn-secondary" style={{ marginTop: 'var(--space-6)', display: 'inline-flex' }}>
          Return home
        </a>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: 480 }}>
      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          background: 'var(--color-white)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: 4,
          marginBottom: 'var(--space-6)',
        }}
      >
        {(['signin', 'register'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setActiveTab(t); setError(null) }}
            style={{
              flex: 1,
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              transition: 'background var(--transition-fast), color var(--transition-fast)',
              background: activeTab === t ? 'var(--color-navy)' : 'transparent',
              color: activeTab === t ? 'var(--color-cream)' : 'var(--color-text-muted)',
            }}
          >
            {t === 'signin' ? 'Sign In' : 'Register'}
          </button>
        ))}
      </div>

      <div className="card">
        {/* Sign In */}
        {activeTab === 'signin' && (
          <form onSubmit={handleSignIn}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-navy)', marginBottom: 'var(--space-6)' }}>
              Welcome back
            </h2>

            <div className="form-group">
              <label htmlFor="signin-email" className="form-label required">Email</label>
              <input
                id="signin-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="signin-password" className="form-label required">Password</label>
              <input
                id="signin-password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p style={{ color: 'var(--color-steel)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Register */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-navy)', marginBottom: 'var(--space-6)' }}>
              Apply to join WildWise
            </h2>

            <div className="form-group">
              <label htmlFor="reg-name" className="form-label required">Full Name</label>
              <input
                id="reg-name"
                type="text"
                className="form-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-phone" className="form-label">
                Phone Number{' '}
                <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(optional)</span>
              </label>
              <input
                id="reg-phone"
                type="tel"
                className="form-input"
                placeholder="e.g. (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email" className="form-label required">Email</label>
              <input
                id="reg-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-password" className="form-label required">Password</label>
              <input
                id="reg-password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <span className="form-hint">At least 8 characters.</span>
            </div>

            <div className="form-group">
              <label htmlFor="reg-role" className="form-label required">Your Role</label>
              <select
                id="reg-role"
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                required
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              {selectedRole?.description && (
                <span className="form-hint">{selectedRole.description}</span>
              )}
            </div>

            {(role === 'licensed_rehabber' || role === 'licensed_vet') && (
              <div className="form-group">
                <label htmlFor="reg-license" className="form-label required">DNR License Number</label>
                <input
                  id="reg-license"
                  type="text"
                  className="form-input"
                  placeholder="e.g. MI-2024-0042"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  required
                />
              </div>
            )}

            {selectedRole?.requiresApproval && (
              <div
                className="coming-soon"
                style={{ display: 'flex', marginBottom: 'var(--space-5)', width: 'fit-content' }}
              >
                {selectedRole.requiresApproval === 'admin'
                  ? 'Requires admin approval'
                  : 'Requires rehabber approval'}
              </div>
            )}

            {error && (
              <p style={{ color: 'var(--color-steel)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Submitting…' : 'Submit Application'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
