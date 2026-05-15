'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { acceptCase, assignCase, assignToSubPermittee, transferCase, updateCaseStatus } from '../actions'
import type { WildlifeCase, CaseStatus, UserRole } from '@/types'

interface Person { id: string; display_name: string | null }

interface Props {
  c: WildlifeCase
  role: UserRole
  rehabbers: Person[]
  subPermittees: Person[]
  otherRehabbers: Person[]
}

const STATUS_OPTIONS: { status: CaseStatus; label: string }[] = [
  { status: 'open',                       label: 'Return to Open' },
  { status: 'accepted',                   label: 'Accepted by Rehabber' },
  { status: 'pending_transport',          label: 'Pending Transport' },
  { status: 'transport_secured',          label: 'Transport Secured' },
  { status: 'en_route',                   label: 'En Route' },
  { status: 'in_care',                    label: 'In Care' },
  { status: 'assigned_to_sub_permittee',  label: 'With Sub-Permittee' },
  { status: 'pending_release',            label: 'Pending Release' },
  { status: 'unreleasable',              label: 'Unreleasable' },
  { status: 'did_not_make_it',            label: 'Did Not Make It' },
]

export default function CaseActions({ c, role, rehabbers, subPermittees, otherRehabbers }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [selectedRehabber, setSelectedRehabber] = useState('')
  const [selectedSub, setSelectedSub] = useState('')
  const [selectedTransfer, setSelectedTransfer] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isTerminal = c.status === 'unreleasable' || c.status === 'did_not_make_it'
  const isOpen = c.status === 'open'
  const isAdmin = role === 'admin'
  const isRehabber = role === 'licensed_rehabber'

  // Only admins, rehabbers, and sub-permittees have actions
  if (role === 'finder' || role === 'volunteer' || role === 'transport_volunteer' || role === 'licensed_vet') return null

  function run<T>(fn: () => Promise<{ error?: string } & T>) {
    setError(null)
    startTransition(async () => {
      const result = await fn()
      if (result.error) { setError(result.error); return }
      router.refresh()
    })
  }

  return (
    <div className="card" style={{ opacity: pending ? 0.6 : 1, transition: 'opacity 0.15s' }}>
      <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
        Actions
      </p>

      {error && (
        <p style={{ fontSize: 'var(--text-sm)', color: '#c15439', marginBottom: 'var(--space-4)' }}>{error}</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Accept — open case + rehabber */}
        {isOpen && isRehabber && (
          <button
            className="btn-primary"
            onClick={() => run(() => acceptCase(c.id))}
            disabled={pending}
            style={{ width: '100%' }}
          >
            {pending ? 'Accepting…' : 'Accept Case →'}
          </button>
        )}

        {/* Admin: assign to rehabber */}
        {isAdmin && !isTerminal && rehabbers.length > 0 && (
          <div>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-navy)', marginBottom: 'var(--space-2)' }}>
              Assign to Rehabber
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <select
                className="form-input"
                value={selectedRehabber}
                onChange={e => setSelectedRehabber(e.target.value)}
                style={{ flex: 1, fontSize: 'var(--text-sm)' }}
              >
                <option value="">Select rehabber…</option>
                {rehabbers.map(r => (
                  <option key={r.id} value={r.id}>{r.display_name ?? r.id.slice(0, 8)}</option>
                ))}
              </select>
              <button
                className="btn-primary"
                onClick={() => run(() => assignCase(c.id, selectedRehabber))}
                disabled={!selectedRehabber || pending}
                style={{ flexShrink: 0 }}
              >
                Assign
              </button>
            </div>
          </div>
        )}

        {/* Rehabber: transport (status = accepted) */}
        {isRehabber && c.status === 'accepted' && (
          <div>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-navy)', marginBottom: 'var(--space-2)' }}>
              Transportation
            </p>
            {c.finder_can_transport && (
              <div style={{
                fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)',
                background: 'rgba(103,133,83,0.06)', border: '1px solid rgba(103,133,83,0.3)',
                borderRadius: 'var(--radius-md)', padding: 'var(--space-3)',
                marginBottom: 'var(--space-3)',
              }}>
                Finder can transport{c.finder_transport_miles ? ` up to ${c.finder_transport_miles} mi` : ''}
                {c.finder_name && ` · ${c.finder_name}`}
                {c.finder_phone && (
                  <> · <a href={`tel:${c.finder_phone}`} style={{ color: 'var(--color-steel)' }}>{c.finder_phone}</a></>
                )}
              </div>
            )}
            <button
              className="btn-primary"
              onClick={() => run(() => updateCaseStatus(c.id, 'pending_transport'))}
              disabled={pending}
              style={{ width: '100%' }}
            >
              Request Transport Volunteer →
            </button>
          </div>
        )}

        {/* Rehabber: assign to sub-permittee */}
        {isRehabber && !isTerminal && subPermittees.length > 0 && (
          <div>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-navy)', marginBottom: 'var(--space-1)' }}>
              Assign to Sub-Permittee
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
              Case stays in your caseload.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <select
                className="form-input"
                value={selectedSub}
                onChange={e => setSelectedSub(e.target.value)}
                style={{ flex: 1, fontSize: 'var(--text-sm)' }}
              >
                <option value="">Select sub-permittee…</option>
                {subPermittees.map(p => (
                  <option key={p.id} value={p.id}>{p.display_name ?? p.id.slice(0, 8)}</option>
                ))}
              </select>
              <button
                className="btn-primary"
                onClick={() => run(() => assignToSubPermittee(c.id, selectedSub))}
                disabled={!selectedSub || pending}
                style={{ flexShrink: 0 }}
              >
                Assign
              </button>
            </div>
          </div>
        )}

        {/* Rehabber: transfer to another rehabber */}
        {isRehabber && !isTerminal && otherRehabbers.length > 0 && (
          <div>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-navy)', marginBottom: 'var(--space-1)' }}>
              Transfer to Another Rehabber
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
              Fully transfers — case will leave your caseload.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <select
                className="form-input"
                value={selectedTransfer}
                onChange={e => setSelectedTransfer(e.target.value)}
                style={{ flex: 1, fontSize: 'var(--text-sm)' }}
              >
                <option value="">Select rehabber…</option>
                {otherRehabbers.map(p => (
                  <option key={p.id} value={p.id}>{p.display_name ?? p.id.slice(0, 8)}</option>
                ))}
              </select>
              <button
                className="btn-secondary"
                onClick={() => run(() => transferCase(c.id, selectedTransfer))}
                disabled={!selectedTransfer || pending}
                style={{ flexShrink: 0 }}
              >
                Transfer
              </button>
            </div>
          </div>
        )}

        {/* Status update (non-open, non-terminal) */}
        {!isOpen && !isTerminal && (
          <div>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-navy)', marginBottom: 'var(--space-2)' }}>
              Update Status
            </p>
            <select
              className="form-input"
              value=""
              disabled={pending}
              onChange={e => {
                const val = e.target.value as CaseStatus
                if (val) run(() => updateCaseStatus(c.id, val))
              }}
              style={{ width: '100%', fontSize: 'var(--text-sm)' }}
            >
              <option value="" disabled>Select new status…</option>
              {STATUS_OPTIONS.filter(o => o.status !== c.status).map(({ status: s, label }) => (
                <option key={s} value={s}>{label}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
