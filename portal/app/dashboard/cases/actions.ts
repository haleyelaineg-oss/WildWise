'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type { CaseStatus, UserProfile } from '@/types'

async function getAuthedClients() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<Pick<UserProfile, 'role'>>()

  const isAdmin = profile?.role === 'admin'
  const db = isAdmin ? createServiceClient() : supabase

  return { user, isAdmin, db }
}

export async function acceptCase(caseId: string): Promise<{ error?: string }> {
  const auth = await getAuthedClients()
  if (!auth) return { error: 'Not authenticated' }

  const { user, db } = auth

  const { error } = await db
    .from('wildlife_cases')
    .update({
      assigned_to: user.id,
      assigned_at: new Date().toISOString(),
      status:      'accepted',
    })
    .eq('id', caseId)
    .eq('status', 'open')

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/cases/${caseId}`)
  return {}
}

export async function assignCase(
  caseId: string,
  rehabberProfileId: string,
): Promise<{ error?: string }> {
  const auth = await getAuthedClients()
  if (!auth) return { error: 'Not authenticated' }

  const { user, db } = auth

  const { error } = await db
    .from('wildlife_cases')
    .update({
      assigned_to: rehabberProfileId,
      assigned_at: new Date().toISOString(),
      assigned_by: user.id,
      status:      'accepted',
    })
    .eq('id', caseId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/cases/${caseId}`)
  return {}
}

export async function assignToSubPermittee(
  caseId: string,
  subProfileId: string,
): Promise<{ error?: string }> {
  const auth = await getAuthedClients()
  if (!auth) return { error: 'Not authenticated' }

  const { db } = auth

  const { error } = await db
    .from('wildlife_cases')
    .update({
      sub_assigned_to: subProfileId,
      status: 'assigned_to_sub_permittee',
    })
    .eq('id', caseId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/cases/${caseId}`)
  return {}
}

export async function transferCase(
  caseId: string,
  rehabberProfileId: string,
): Promise<{ error?: string }> {
  const auth = await getAuthedClients()
  if (!auth) return { error: 'Not authenticated' }

  const { db } = auth

  const { error } = await db
    .from('wildlife_cases')
    .update({
      assigned_to: rehabberProfileId,
      sub_assigned_to: null,
      status: 'accepted',
    })
    .eq('id', caseId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/cases/${caseId}`)
  return {}
}

export async function updateCaseStatus(
  caseId: string,
  status: CaseStatus,
): Promise<{ error?: string }> {
  const auth = await getAuthedClients()
  if (!auth) return { error: 'Not authenticated' }

  const { db } = auth

  const update: Record<string, unknown> = { status }
  if (status === 'open') {
    update.assigned_to = null
    update.assigned_at = null
    update.sub_assigned_to = null
  }

  const { error } = await db
    .from('wildlife_cases')
    .update(update)
    .eq('id', caseId)


  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/cases/${caseId}`)
  return {}
}

export async function closeCase(
  caseId: string,
  closeReason: string,
  status: CaseStatus,
): Promise<{ error?: string }> {
  const auth = await getAuthedClients()
  if (!auth) return { error: 'Not authenticated' }

  const { db } = auth

  const { error } = await db
    .from('wildlife_cases')
    .update({
      status,
      close_reason: closeReason,
      closed_at: new Date().toISOString(),
    })
    .eq('id', caseId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/cases/${caseId}`)
  return {}
}
