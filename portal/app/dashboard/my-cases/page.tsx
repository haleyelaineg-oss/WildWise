import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MyCasesTable from '../_components/MyCasesTable'
import type { WildlifeCase } from '@/types'

export default async function MyCasesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('wildlife_cases')
    .select('*')
    .eq('assigned_to', user.id)
    .order('created_at', { ascending: false })

  const cases = (data ?? []) as WildlifeCase[]

  return (
    <div className="section section--sm">
      <div className="container">
        <div className="section-header" style={{ marginBottom: 'var(--space-6)' }}>
          <span className="section-label">Your Cases</span>
          <h2 style={{ marginTop: 'var(--space-2)' }}>My Cases</h2>
          <p>Animals you&apos;ve accepted and are currently managing.</p>
        </div>
        <MyCasesTable cases={cases} />
      </div>
    </div>
  )
}
