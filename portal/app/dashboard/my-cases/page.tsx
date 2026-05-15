import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MyCasesTable from '../_components/MyCasesTable'
import type { WildlifeCase } from '@/types'

export default async function MyCasesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single<{ email: string }>()

  const [
    { data: casesData },
    { data: subData },
    { data: rehabberData },
  ] = await Promise.all([
    supabase
      .from('wildlife_cases')
      .select('*')
      .eq('assigned_to', user.id)
      .order('created_at', { ascending: false }),
    // Sub-permittees linked to this rehabber via their rehabber_email
    supabase
      .from('profiles')
      .select('id, display_name')
      .eq('role', 'sub_permittee')
      .eq('approved', true)
      .eq('rehabber_email', profile?.email ?? ''),
    // Other approved rehabbers for transfers
    supabase
      .from('profiles')
      .select('id, display_name')
      .eq('role', 'licensed_rehabber')
      .eq('approved', true)
      .neq('id', user.id),
  ])

  const cases = (casesData ?? []) as WildlifeCase[]
  const subPermittees = (subData ?? []) as { id: string; display_name: string | null }[]
  const rehabbers = (rehabberData ?? []) as { id: string; display_name: string | null }[]

  return (
    <div className="section section--sm">
      <div className="container">
        <div className="section-header" style={{ marginBottom: 'var(--space-6)' }}>
          <span className="section-label">Your Cases</span>
          <h2 style={{ marginTop: 'var(--space-2)' }}>My Cases</h2>
          <p>Animals you&apos;ve accepted and are currently managing.</p>
        </div>
        <MyCasesTable cases={cases} subPermittees={subPermittees} rehabbers={rehabbers} />
      </div>
    </div>
  )
}
