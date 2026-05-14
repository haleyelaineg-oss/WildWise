'use client'

import { useRef } from 'react'
import { setViewAsRole, clearViewAsRole } from './actions'
import type { UserRole } from '@/types'

const ROLES: { role: UserRole; label: string }[] = [
  { role: 'licensed_rehabber', label: 'Licensed Rehabber' },
  { role: 'licensed_vet', label: 'Licensed Vet' },
  { role: 'sub_permittee', label: 'Sub-permittee' },
  { role: 'volunteer', label: 'Volunteer' },
  { role: 'transport_volunteer', label: 'Transport Volunteer' },
  { role: 'finder', label: 'Finder / Public' },
]

export default function ViewAsBar({ activeRole }: { activeRole: UserRole | null }) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <div className="view-as-bar">
      <span className="view-as-bar__eyebrow">Admin Preview</span>

      <form ref={formRef} className="view-as-bar__form" action={async (fd) => {
        const role = fd.get('role') as UserRole
        await setViewAsRole(role)
      }}>
        <label htmlFor="view-as-select" className="view-as-bar__label">
          Viewing as
        </label>
        <select
          key={activeRole ?? 'none'}
          id="view-as-select"
          name="role"
          className="view-as-bar__select"
          defaultValue={activeRole ?? ''}
          onChange={() => formRef.current?.requestSubmit()}
        >
          <option value="" disabled>— pick a role —</option>
          {ROLES.map(({ role, label }) => (
            <option key={role} value={role}>{label}</option>
          ))}
        </select>
      </form>

      {activeRole && (
        <form action={clearViewAsRole}>
          <button type="submit" className="view-as-bar__exit">
            Back to Admin
          </button>
        </form>
      )}
    </div>
  )
}
