'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton() {
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <button onClick={signOut} className="btn-secondary btn-secondary--light" style={{ padding: 'var(--space-2) var(--space-4)' }}>
      Sign out
    </button>
  )
}
