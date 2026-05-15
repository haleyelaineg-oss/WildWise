'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { assignCase, updateCaseStatus } from '../cases/actions'
import {
  formatAnimal, timeAgo,
  AGE_LABELS, CONDITION_LABELS, STATUS_CONFIG,
} from './caseUtils'
import type { WildlifeCaseWithAssignee, CaseStatus } from '@/types'

interface Rehabber {
  id: string
  display_name: string | null
}

interface Props {
  cases: WildlifeCaseWithAssignee[]
  rehabbers: Rehabber[]
}

const STATUS_FILTERS: { value: CaseStatus | 'all'; label: string }[] = [
  { value: 'all',                      label: 'All' },
  { value: 'open',                     label: 'Pending Acceptance' },
  { value: 'accepted',                 label: 'Accepted by Rehabber' },
  { value: 'pending_transport',        label: 'Pending Transport' },
  { value: 'in_care',                  label: 'In Care' },
  { value: 'pending_release',          label: 'Pending Release' },
  { value: 'unreleasable',             label: 'Unreleasable' },
  { value: 'did_not_make_it',          label: 'Did Not Make It' },
]

export default function AdminCasesTable({ cases, rehabbers }: Props) {
  const [filter, setFilter] = useState<CaseStatus | 'all'>('all')

  const visible = filter === 'all' ? cases : cases.filter(c => c.status === filter)

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-5)' }}>
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: filter === f.value ? 700 : 400,
              padding: '4px 12px',
              borderRadius: 999,
              border: '1px solid var(--color-border)',
              background: filter === f.value ? 'var(--color-navy)' : 'transparent',
              color: filter === f.value ? 'white' : 'var(--color-text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {f.label}
            {f.value !== 'all' && (
              <span style={{ marginLeft: 4, opacity: 0.7 }}>
                ({cases.filter(c => c.status === f.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="card" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
          No cases match this filter.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {visible.map(c => (
            <AdminCaseRow key={c.id} c={c} rehabbers={rehabbers} />
          ))}
        </div>
      )}
    </div>
  )
}

function AdminCaseRow({ c, rehabbers }: { c: WildlifeCaseWithAssignee; rehabbers: Rehabber[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [selectedRehabber, setSelectedRehabber] = useState('')
  const status = STATUS_CONFIG[c.status]

  function handleAssign() {
    if (!selectedRehabber) return
    startTransition(async () => {
      await assignCase(c.id, selectedRehabber)
      setSelectedRehabber('')
    })
  }

  function handleStatus(newStatus: Exclude<CaseStatus, 'open'>) {
    startTransition(async () => {
      await updateCaseStatus(c.id, newStatus)
    })
  }

  const isTerminal = c.status === 'unreleasable' || c.status === 'did_not_make_it'

  return (
    <div
      className="card"
      onClick={() => router.push(`/dashboard/cases/${c.id}`)}
      style={{
        borderLeft: c.is_urgent ? '4px solid #c15439' : '4px solid transparent',
        opacity: pending ? 0.6 : 1,
        transition: 'opacity 0.15s',
        cursor: 'pointer',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {c.is_urgent && <span className="badge">Urgent</span>}
          <span style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--color-navy)' }}>
            {formatAnimal(c.animal_species, c.animal_detail)}
          </span>
          {c.animal_age && (
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              · {AGE_LABELS[c.animal_age] ?? c.animal_age}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
            #{c.id.slice(0, 8)}
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            {timeAgo(c.created_at)}
          </span>
          <span style={{
            fontSize: 'var(--text-xs)', fontWeight: 600,
            padding: '2px 8px', borderRadius: 999,
            color: status.color, background: status.bg,
          }}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Conditions */}
      {c.conditions.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
          {c.conditions.map(cond => (
            <span
              key={cond}
              style={{
                fontSize: 'var(--text-xs)',
                padding: '2px 8px',
                borderRadius: 999,
                background: 'rgba(27,51,73,0.07)',
                color: 'var(--color-navy)',
              }}
            >
              {CONDITION_LABELS[cond] ?? cond}
            </span>
          ))}
        </div>
      )}

      {/* Assigned to */}
      {c.assigned_profile && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
          Assigned to: <strong style={{ color: 'var(--color-navy)' }}>{c.assigned_profile.display_name ?? 'Unknown'}</strong>
        </p>
      )}

      {/* Footer: ZIP + actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)', marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          ZIP: <strong style={{ color: 'var(--color-navy)' }}>{c.found_zip}</strong>
          {c.current_zip && c.current_zip !== c.found_zip && ` → ${c.current_zip}`}
        </span>

        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Assign dropdown (show when not terminal) */}
          {!isTerminal && rehabbers.length > 0 && (
            <>
              <select
                className="form-input"
                value={selectedRehabber}
                onClick={e => e.stopPropagation()}
                onChange={e => setSelectedRehabber(e.target.value)}
                style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-3)', minWidth: 160 }}
              >
                <option value="">Assign to rehabber…</option>
                {rehabbers.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.display_name ?? r.id.slice(0, 8)}
                  </option>
                ))}
              </select>
              <button
                className="btn-primary"
                onClick={e => { e.stopPropagation(); handleAssign() }}
                disabled={!selectedRehabber || pending}
                style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-4)' }}
              >
                Assign
              </button>
            </>
          )}

          {/* Quick status buttons */}
          {!isTerminal && c.status !== 'open' && (
            <>
              {c.status !== 'in_care' && (
                <button
                  className="btn-secondary"
                  onClick={e => { e.stopPropagation(); handleStatus('in_care') }}
                  disabled={pending}
                  style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-4)' }}
                >
                  In Care
                </button>
              )}
              {c.status !== 'pending_release' && (
                <button
                  className="btn-primary"
                  onClick={e => { e.stopPropagation(); handleStatus('pending_release') }}
                  disabled={pending}
                  style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-4)' }}
                >
                  Pending Release
                </button>
              )}
              <button
                className="btn-secondary"
                onClick={e => { e.stopPropagation(); handleStatus('did_not_make_it') }}
                disabled={pending}
                style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-4)' }}
              >
                Did Not Make It
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
