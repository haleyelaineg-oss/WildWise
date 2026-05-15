import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import {
  formatAnimal, timeAgo,
  AGE_LABELS, CONDITION_LABELS, STATUS_CONFIG,
} from '../../_components/caseUtils'
import type { UserProfile, UserRole, WildlifeCase } from '@/types'
import CaseActions from './CaseActions'

type CaseWithProfiles = WildlifeCase & {
  assigned_profile: { display_name: string | null } | null
  sub_profile: { display_name: string | null } | null
}

interface Person { id: string; display_name: string | null }

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, approved')
    .eq('id', user.id)
    .single<Pick<UserProfile, 'role' | 'approved'>>()

  const role: UserRole = profile?.role ?? 'finder'
  const isAdmin = role === 'admin'
  const db = isAdmin ? createServiceClient() : supabase

  const { data: caseData } = await db
    .from('wildlife_cases')
    .select('*, assigned_profile:profiles!assigned_to(display_name), sub_profile:profiles!sub_assigned_to(display_name)')
    .eq('id', id)
    .single()

  if (!caseData) notFound()

  const c = caseData as CaseWithProfiles
  const status = STATUS_CONFIG[c.status]
  const isTerminal = c.status === 'unreleasable' || c.status === 'did_not_make_it'

  let rehabbers: Person[] = []
  let subPermittees: Person[] = []
  let otherRehabbers: Person[] = []

  if (isAdmin && !isTerminal) {
    const { data } = await db
      .from('profiles')
      .select('id, display_name')
      .eq('role', 'licensed_rehabber')
      .eq('approved', true)
    rehabbers = (data ?? []) as Person[]
  }

  if (role === 'licensed_rehabber' && !isTerminal) {
    const [{ data: subs }, { data: rehabs }] = await Promise.all([
      supabase.from('profiles').select('id, display_name').eq('role', 'sub_permittee'),
      supabase.from('profiles').select('id, display_name').eq('role', 'licensed_rehabber').eq('approved', true).neq('id', user.id),
    ])
    subPermittees = (subs ?? []) as Person[]
    otherRehabbers = (rehabs ?? []) as Person[]
  }

  return (
    <div className="section section--sm">
      <div className="container">
        {/* Nav row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <Link
            href="/dashboard"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--color-steel)', textDecoration: 'none' }}
          >
            ← Dashboard
          </Link>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
            #{c.id.slice(0, 8)} · {timeAgo(c.created_at)}
          </span>
        </div>

        {/* Case header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            {c.is_urgent && <span className="badge">Urgent</span>}
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)', margin: 0 }}>
              {formatAnimal(c.animal_species, c.animal_detail)}
            </h2>
            {c.animal_age && (
              <span style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)' }}>
                · {AGE_LABELS[c.animal_age] ?? c.animal_age}
              </span>
            )}
          </div>
          <span style={{
            fontSize: 'var(--text-sm)', fontWeight: 700,
            padding: '5px 14px', borderRadius: 999,
            color: status.color, background: status.bg,
            flexShrink: 0,
          }}>
            {status.label}
          </span>
        </div>

        {/* Two-column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>

          {/* Left: animal details + location */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="card">
              <SectionLabel>Animal Details</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <Row label="Species" value={formatAnimal(c.animal_species, c.animal_detail)} />
                {c.animal_age && <Row label="Age" value={AGE_LABELS[c.animal_age] ?? c.animal_age} />}
              </div>

              {c.conditions.length > 0 && (
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>Conditions</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {c.conditions.map(cond => (
                      <span key={cond} style={{
                        fontSize: 'var(--text-xs)', padding: '3px 10px', borderRadius: 999,
                        background: 'rgba(27,51,73,0.07)', color: 'var(--color-navy)', fontWeight: 500,
                      }}>
                        {CONDITION_LABELS[cond] ?? cond}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {c.injury_symptoms.length > 0 && (
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>Symptoms</p>
                  <ul style={{ margin: 0, paddingLeft: 'var(--space-5)', fontSize: 'var(--text-sm)', color: 'var(--color-navy)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                    {c.injury_symptoms.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              {c.no_mom_time && (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-4)' }}>
                  Mom absent for: <strong style={{ color: 'var(--color-navy)' }}>{c.no_mom_time}</strong>
                </p>
              )}

              {c.condition_desc && (
                <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>Finder notes</p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-navy)', maxWidth: 'none' }}>{c.condition_desc}</p>
                </div>
              )}
            </div>

            <div className="card">
              <SectionLabel>Location</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <Row label="Found ZIP" value={c.found_zip} />
                {c.found_county && <Row label="County" value={c.found_county} />}
                {c.current_zip && c.current_zip !== c.found_zip && (
                  <Row label="Current ZIP" value={c.current_zip} />
                )}
              </div>
            </div>
          </div>

          {/* Right: finder info + assignment + actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {(c.finder_name || c.finder_phone || c.finder_can_transport !== null) && (
              <div className="card">
                <SectionLabel>Finder Information</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {c.finder_name && <Row label="Name" value={c.finder_name} />}
                  {c.finder_phone && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)' }}>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', flexShrink: 0 }}>Phone</span>
                      <a href={`tel:${c.finder_phone}`} style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-steel)', textDecoration: 'none' }}>
                        {c.finder_phone}
                      </a>
                    </div>
                  )}
                  {c.finder_can_transport !== null && (
                    <Row
                      label="Can transport"
                      value={c.finder_can_transport
                        ? `Yes${c.finder_transport_miles ? ` · up to ${c.finder_transport_miles} mi` : ''}`
                        : 'No'}
                    />
                  )}
                </div>
              </div>
            )}

            {(c.assigned_to || c.sub_assigned_to) && (
              <div className="card">
                <SectionLabel>Assignment</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {c.assigned_profile?.display_name && (
                    <Row label="Rehabber" value={c.assigned_profile.display_name} />
                  )}
                  {c.assigned_at && (
                    <Row
                      label="Accepted"
                      value={new Date(c.assigned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    />
                  )}
                  {c.sub_profile?.display_name && (
                    <Row label="Sub-permittee" value={c.sub_profile.display_name} />
                  )}
                </div>
              </div>
            )}

            <CaseActions
              c={c}
              role={role}
              rehabbers={rehabbers}
              subPermittees={subPermittees}
              otherRehabbers={otherRehabbers}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
      {children}
    </p>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)' }}>
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-navy)', textAlign: 'right' }}>{value}</span>
    </div>
  )
}
