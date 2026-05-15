import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { ADMIN_APPROVED_ROLES, REHABBER_APPROVED_ROLES, type UserProfile, type UserRole } from '@/types'
import SignOutButton from './SignOutButton'
import ViewAsBar from './ViewAsBar'
import DashboardSidebar from './_components/DashboardSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, role, approved, license_number, email')
    .eq('id', user.id)
    .single<UserProfile>()

  const role = profile?.role ?? (user.user_metadata?.role as UserProfile['role'] | undefined) ?? 'finder'
  const approved = profile?.approved ?? false
  const displayName = profile?.display_name ?? user.email ?? 'User'

  const needsAdminApproval = ADMIN_APPROVED_ROLES.includes(role) && !approved
  const needsRehabberApproval = REHABBER_APPROVED_ROLES.includes(role) && !approved

  if (needsAdminApproval || needsRehabberApproval) {
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
          padding: 'var(--space-8)',
        }}
      >
        <div className="card" style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div className="coming-soon" style={{ margin: '0 auto var(--space-6)', width: 'fit-content' }}>
            Pending Approval
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)', marginBottom: 'var(--space-4)' }}>
            Your account is under review
          </h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: 'none' }}>
            {needsAdminApproval
              ? 'A WildWise admin will verify your license and approve your account. You\'ll receive an email when you\'re approved.'
              : 'Your sponsoring rehabilitator needs to approve your sub-permittee account. Contact them directly if you haven\'t heard back.'}
          </p>
          <div className="btn-group" style={{ marginTop: 'var(--space-6)', justifyContent: 'center' }}>
            <Link href="/" className="btn-secondary">Return home</Link>
            <SignOutButton />
          </div>
        </div>
      </main>
    )
  }

  const isAdmin = role === 'admin'
  const jar = await cookies()
  const viewAsRole = isAdmin ? (jar.get('ww_view_as')?.value as UserRole | undefined) ?? null : null
  const effectiveRole = viewAsRole ?? role
  const hasSidebar = effectiveRole === 'licensed_rehabber'

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--color-cream)' }}>
      {/* Dashboard nav */}
      <header
        style={{
          background: 'var(--color-navy)',
          borderBottom: '1px solid rgba(134,187,216,0.15)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--z-nav)',
        }}
      >
        <div
          className="container"
          style={{
            height: 'var(--nav-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link href="/" className="nav__logo">
            <Image src="/assets/logos/full-color-circle-logo.png" alt="" width={52} height={52} style={{ height: 52, width: 'auto' }} />
            <span className="nav__logo-text">
              <span className="wild">WILD</span>
              <span className="wise">WISE</span>
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-cream)', fontWeight: 600 }}>
                {displayName}
              </p>
              <span className="badge badge--steel" style={{ fontSize: '0.65rem' }}>
                {role.replace(/_/g, ' ')}
              </span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* View As bar — admin only, sits below the header */}
      {isAdmin && <ViewAsBar activeRole={viewAsRole} />}

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {hasSidebar && <DashboardSidebar role={effectiveRole as UserRole} />}
        <main id="main-content" style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
