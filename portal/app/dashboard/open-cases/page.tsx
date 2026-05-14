import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OpenCasesTable from '../_components/OpenCasesTable'
import type { WildlifeCase } from '@/types'

export default async function OpenCasesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('wildlife_cases')
    .select('*')
    .eq('status', 'open')
    .order('is_urgent', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100)

  const cases = (data ?? []) as WildlifeCase[]

  return (
    <div className="section section--sm">
      <div className="container">
        <div className="section-header" style={{ marginBottom: 'var(--space-6)' }}>
          <span className="section-label">Incoming</span>
          <h2 style={{ marginTop: 'var(--space-2)' }}>All Open Cases</h2>
          <p>Unassigned cases waiting for a rehabilitator to accept.</p>
        </div>
        <OpenCasesTable cases={cases} />
      </div>
    </div>
  )
}
