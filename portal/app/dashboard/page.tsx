import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import OpenCasesTable from './_components/OpenCasesTable'
import AdminCasesTable from './_components/AdminCasesTable'
import MyCasesTable from './_components/MyCasesTable'
import type { UserProfile, UserRole, WildlifeCase, WildlifeCaseWithAssignee } from '@/types'

/* ── Role-specific content ───────────────────────────────────────────────── */

function RehabberDashboard({
  profile,
  openCases,
  myCasesCount,
}: {
  profile: UserProfile
  openCases: WildlifeCase[]
  myCasesCount: number
}) {
  const urgentCount = openCases.filter(c => c.is_urgent).length
  const recentOpen = openCases.slice(0, 3)

  return (
    <>
      <div className="section-header">
        <span className="section-label">Licensed Rehabilitator</span>
        <h2 style={{ marginTop: 'var(--space-2)' }}>Welcome back, {profile.display_name?.split(' ')[0]}</h2>
        <p>Here&apos;s your overview for today.</p>
      </div>

      {/* Stat cards */}
      <div className="card-grid card-grid--3" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="card">
          <span className="section-label">Incoming</span>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-navy)', fontFamily: 'var(--font-display)', lineHeight: 1.1, marginTop: 'var(--space-2)' }}>
            {openCases.length}{openCases.length >= 50 ? '+' : ''}
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>Open cases</p>
          <Link href="/dashboard/open-cases" className="card__link" style={{ marginTop: 'var(--space-4)', display: 'inline-flex' }}>
            View all →
          </Link>
        </div>
        <div className="card">
          <span className="section-label">Your Cases</span>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-navy)', fontFamily: 'var(--font-display)', lineHeight: 1.1, marginTop: 'var(--space-2)' }}>
            {myCasesCount}
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>Cases accepted</p>
          <Link href="/dashboard/my-cases" className="card__link" style={{ marginTop: 'var(--space-4)', display: 'inline-flex' }}>
            View all →
          </Link>
        </div>
        {urgentCount > 0 ? (
          <div className="card" style={{ borderLeft: '3px solid #c15439' }}>
            <span className="section-label" style={{ color: '#c15439' }}>Urgent</span>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: '#c15439', fontFamily: 'var(--font-display)', lineHeight: 1.1, marginTop: 'var(--space-2)' }}>
              {urgentCount}
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>Need immediate attention</p>
            <Link href="/dashboard/open-cases" className="card__link" style={{ marginTop: 'var(--space-4)', display: 'inline-flex' }}>
              View →
            </Link>
          </div>
        ) : (
          <div className="card">
            <span className="section-label">Urgent</span>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-olive)', fontFamily: 'var(--font-display)', lineHeight: 1.1, marginTop: 'var(--space-2)' }}>
              0
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>No urgent cases right now</p>
          </div>
        )}
      </div>

      {/* Recent open cases preview */}
      {recentOpen.length > 0 && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-4)' }}>
            <div>
              <span className="section-label">Incoming</span>
              <h3 style={{ marginTop: 'var(--space-1)' }}>Recent Open Cases</h3>
            </div>
            <Link href="/dashboard/open-cases" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-steel)', textDecoration: 'none' }}>
              View all →
            </Link>
          </div>
          <OpenCasesTable cases={recentOpen} />
        </div>
      )}
    </>
  )
}

function SubPermitteeDashboard({
  profile,
  cases,
}: {
  profile: UserProfile
  cases: WildlifeCase[]
}) {
  return (
    <>
      <div className="section-header">
        <span className="section-label">Sub-Permittee</span>
        <h2 style={{ marginTop: 'var(--space-2)' }}>Welcome, {profile.display_name?.split(' ')[0]}</h2>
        <p>Cases assigned to you by your sponsoring rehabilitator.</p>
      </div>
      <MyCasesTable cases={cases} />
    </>
  )
}

function VolunteerDashboard({ profile }: { profile: UserProfile }) {
  return (
    <>
      <div className="section-header">
        <span className="section-label">
          {profile.role === 'transport_volunteer' ? 'Transport Volunteer' : 'Volunteer'}
        </span>
        <h2 style={{ marginTop: 'var(--space-2)' }}>Welcome, {profile.display_name?.split(' ')[0]}</h2>
        <p>
          {profile.role === 'transport_volunteer'
            ? 'See available animal pickups near you.'
            : 'View tasks and opportunities from your organization.'}
        </p>
      </div>
      <div className="card">
        <span className="section-label">Available</span>
        <h3 className="card__title">
          {profile.role === 'transport_volunteer' ? 'Pickups Near You' : 'Volunteer Opportunities'}
        </h3>
        <p className="card__body">Nothing available right now — check back soon.</p>
      </div>
    </>
  )
}

function VetDashboard({ profile }: { profile: UserProfile }) {
  return (
    <>
      <div className="section-header">
        <span className="section-label">Licensed Veterinarian</span>
        <h2 style={{ marginTop: 'var(--space-2)' }}>Welcome, {profile.display_name?.split(' ')[0]}</h2>
        <p>Review cases that need veterinary consultation.</p>
      </div>
      <div className="card">
        <span className="section-label">Referrals</span>
        <h3 className="card__title">Cases Needing Vet Care</h3>
        <p className="card__body">No cases awaiting vet consultation right now.</p>
        <span className="card__link coming-soon" style={{ display: 'inline-flex', marginTop: 'var(--space-5)' }}>
          Coming soon
        </span>
      </div>
    </>
  )
}

function AdminDashboard({
  allCases,
  rehabbers,
}: {
  allCases: WildlifeCaseWithAssignee[]
  rehabbers: { id: string; display_name: string | null }[]
}) {
  return (
    <>
      <div className="section-header">
        <span className="section-label">Admin</span>
        <h2 style={{ marginTop: 'var(--space-2)' }}>Admin Dashboard</h2>
        <p>Manage users, approve applications, and oversee the platform.</p>
      </div>

      <div className="card-grid card-grid--2" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="card">
          <span className="section-label">Approvals</span>
          <h3 className="card__title">Pending Applications</h3>
          <p className="card__body">Review rehabbers and vets awaiting credential verification.</p>
          <span className="card__link coming-soon" style={{ display: 'inline-flex', marginTop: 'var(--space-5)' }}>
            Coming soon
          </span>
        </div>
        <div className="card">
          <span className="section-label">Users</span>
          <h3 className="card__title">All Users</h3>
          <p className="card__body">Manage roles, suspend accounts, and view the full user directory.</p>
          <span className="card__link coming-soon" style={{ display: 'inline-flex', marginTop: 'var(--space-5)' }}>
            Coming soon
          </span>
        </div>
      </div>

      <div className="section-header" style={{ marginBottom: 'var(--space-4)' }}>
        <span className="section-label">Cases</span>
        <h3 style={{ marginTop: 'var(--space-1)' }}>All Cases</h3>
      </div>
      <AdminCasesTable cases={allCases} rehabbers={rehabbers} />
    </>
  )
}

function FinderDashboard() {
  return (
    <>
      <div className="section-header">
        <span className="section-label">Your Account</span>
        <h2 style={{ marginTop: 'var(--space-2)' }}>Your Reports</h2>
        <p>Track animals you&apos;ve reported and their status.</p>
      </div>
      <div className="card" style={{ maxWidth: 480 }}>
        <h3 className="card__title">No reports yet</h3>
        <p className="card__body">
          When you use the &ldquo;Found an Animal&rdquo; tool and submit a case, it will appear here.
        </p>
        <Link href="/found-an-animal" className="btn-primary" style={{ display: 'inline-flex', marginTop: 'var(--space-5)' }}>
          Found an Animal?
        </Link>
      </div>
    </>
  )
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<UserProfile>()

  const realRole: UserRole = profile?.role ?? (user.user_metadata?.role as UserRole) ?? 'finder'

  const jar = await cookies()
  const viewAsRole = realRole === 'admin'
    ? (jar.get('ww_view_as')?.value as UserRole | undefined) ?? null
    : null

  const role = viewAsRole ?? realRole
  const safeProfile: UserProfile = profile ?? {
    id: user.id,
    email: user.email ?? '',
    role,
    approved: false,
    approved_by: null,
    display_name: user.user_metadata?.display_name ?? null,
    license_number: null,
    created_at: user.created_at,
  }

  const effectiveProfile: UserProfile = { ...safeProfile, role }

  // Pending approval gate — unapproved rehabbers shouldn't see live case data
  if (role === 'licensed_rehabber' && !effectiveProfile.approved) {
    return (
      <div className="section section--sm">
        <div className="container">
          <div style={{ maxWidth: 520 }}>
            <div className="section-header">
              <span className="section-label">Pending Review</span>
              <h2 style={{ marginTop: 'var(--space-2)' }}>Your application is under review</h2>
              <p>Our team is reviewing your credentials — you&apos;ll receive an email once your account is approved.</p>
            </div>
            <div className="card">
              <p className="card__body">
                Once approved, you&apos;ll be able to view incoming cases, accept animals in need, and manage cases
                assigned to you.
              </p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-4)' }}>
                Questions? Email us at{' '}
                <a href="mailto:hello@bewildwise.org" style={{ color: 'var(--color-steel)' }}>
                  hello@bewildwise.org
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Fetch case data for roles that need it
  let openCases: WildlifeCase[] = []
  let myCasesCount = 0
  let allCases: WildlifeCaseWithAssignee[] = []
  let rehabbers: { id: string; display_name: string | null }[] = []
  let subCases: WildlifeCase[] = []

  if (role === 'licensed_rehabber') {
    const [{ data: openData }, { count: myCount }] = await Promise.all([
      supabase
        .from('wildlife_cases')
        .select('*')
        .eq('status', 'open')
        .order('is_urgent', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('wildlife_cases')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', user.id),
    ])
    openCases = (openData ?? []) as WildlifeCase[]
    myCasesCount = myCount ?? 0
  }

  if (role === 'sub_permittee') {
    const { data: subCasesData } = await supabase
      .from('wildlife_cases')
      .select('*')
      .eq('sub_assigned_to', user.id)
      .order('created_at', { ascending: false })
    subCases = (subCasesData ?? []) as WildlifeCase[]
  }

  if (role === 'admin') {
    const [{ data: allData }, { data: rehabberData }] = await Promise.all([
      supabase
        .from('wildlife_cases')
        .select('*, assigned_profile:profiles!assigned_to(display_name)')
        .order('is_urgent', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('id, display_name')
        .eq('role', 'licensed_rehabber')
        .eq('approved', true),
    ])
    allCases = (allData ?? []) as WildlifeCaseWithAssignee[]
    rehabbers = (rehabberData ?? []) as { id: string; display_name: string | null }[]
  }

  let content: React.ReactNode
  if (role === 'licensed_rehabber') {
    content = <RehabberDashboard profile={effectiveProfile} openCases={openCases} myCasesCount={myCasesCount} />
  } else if (role === 'admin') {
    content = <AdminDashboard allCases={allCases} rehabbers={rehabbers} />
  } else if (role === 'sub_permittee') {
    content = <SubPermitteeDashboard profile={effectiveProfile} cases={subCases} />
  } else if (role === 'volunteer' || role === 'transport_volunteer') {
    content = <VolunteerDashboard profile={effectiveProfile} />
  } else if (role === 'licensed_vet') {
    content = <VetDashboard profile={effectiveProfile} />
  } else {
    content = <FinderDashboard />
  }

  return (
    <div className="section section--sm">
      <div className="container">
        {content}
      </div>
    </div>
  )
}
