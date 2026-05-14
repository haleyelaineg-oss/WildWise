'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/types'

const COOKIE = 'ww_view_as'

export async function setViewAsRole(role: UserRole) {
  const jar = await cookies()
  jar.set(COOKIE, role, { path: '/dashboard', httpOnly: true, sameSite: 'lax' })
  redirect('/dashboard')
}

export async function clearViewAsRole(_fd: FormData) {
  const jar = await cookies()
  jar.delete(COOKIE)
  redirect('/dashboard')
}
