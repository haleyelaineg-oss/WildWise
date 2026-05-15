'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CaseStatus } from '@/types'

export async function acceptCase(caseId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('wildlife_cases')
    .update({
      assigned_to: user.id,
      assigned_at:  new Date().toISOString(),
      status:       'accepted',
    })
    .eq('id', caseId)
    .eq('status', 'open') // guard against race condition

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return {}
}

export async function assignCase(
  caseId: string,
  rehabberProfileId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('wildlife_cases')
    .update({
      assigned_to: rehabberProfileId,
      assigned_at:  new Date().toISOString(),
      assigned_by:  user.id,
      status:       'accepted',
    })
    .eq('id', caseId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return {}
}

export async function updateCaseStatus(
  caseId: string,
  status: CaseStatus,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('wildlife_cases')
    .update({ status })
    .eq('id', caseId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return {}
}
