'use client'

import { useTransition } from 'react'
import { updateCaseStatus } from '../cases/actions'
import {
  formatAnimal, timeAgo,
  AGE_LABELS, CONDITION_LABELS, STATUS_CONFIG,
} from './caseUtils'
import type { WildlifeCase, CaseStatus } from '@/types'

export default function MyCasesTable({ cases }: { cases: WildlifeCase[] }) {
  if (cases.length === 0) {
    return (
      <div className="card" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
        You haven&apos;t accepted any cases yet.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {cases.map(c => <CaseRow key={c.id} c={c} />)}
    </div>
  )
}

const STATUS_ACTIONS: { status: Exclude<CaseStatus, 'open'>; label: string }[] = [
  { status: 'in_progress', label: 'In Progress' },
  { status: 'resolved',    label: 'Mark Resolved' },
  { status: 'closed',      label: 'Close' },
]

function CaseRow({ c }: { c: WildlifeCase }) {
  const [pending, startTransition] = useTransition()
  const status = STATUS_CONFIG[c.status]

  function handleStatus(newStatus: Exclude<CaseStatus, 'open'>) {
    startTransition(async () => {
      await updateCaseStatus(c.id, newStatus)
    })
  }

  const isTerminal = c.status === 'resolved' || c.status === 'closed'

  return (
    <div
      className="card"
      style={{
        borderLeft: c.is_urgent ? '4px solid #c15439' : '4px solid var(--color-olive)',
        opacity: pending ? 0.6 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {/* Header row */}
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

      {/* Extra details */}
      {c.no_mom_time && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
          Mom absent: {c.no_mom_time}
        </p>
      )}
      {c.injury_symptoms.length > 0 && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
          Symptoms: {c.injury_symptoms.join(', ')}
        </p>
      )}
      {c.condition_desc && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
          Notes: {c.condition_desc}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          ZIP: <strong style={{ color: 'var(--color-navy)' }}>{c.found_zip}</strong>
          {c.current_zip && c.current_zip !== c.found_zip && ` → ${c.current_zip}`}
        </span>

        {!isTerminal && (
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {STATUS_ACTIONS.filter(a => a.status !== c.status).map(({ status: s, label }) => (
              <button
                key={s}
                onClick={() => handleStatus(s)}
                disabled={pending}
                className={s === 'resolved' ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-4)' }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
