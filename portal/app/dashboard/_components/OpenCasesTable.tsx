'use client'

import React, { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { acceptCase } from '../cases/actions'
import {
  formatAnimal, timeAgo,
  AGE_LABELS, CONDITION_LABELS, STATUS_CONFIG,
} from './caseUtils'
import type { WildlifeCase } from '@/types'

export default function OpenCasesTable({ cases }: { cases: WildlifeCase[] }) {
  if (cases.length === 0) {
    return (
      <div className="card" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
        No open cases right now — check back soon.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {cases.map(c => <CaseRow key={c.id} c={c} />)}
    </div>
  )
}

function CaseRow({ c }: { c: WildlifeCase }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = React.useState<string | null>(null)
  const status = STATUS_CONFIG[c.status]

  function handleAccept() {
    setError(null)
    startTransition(async () => {
      const result = await acceptCase(c.id)
      if (result.error) setError(result.error)
    })
  }

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

      {/* Footer row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          ZIP: <strong style={{ color: 'var(--color-navy)' }}>{c.found_zip}</strong>
          {c.current_zip && c.current_zip !== c.found_zip && ` → ${c.current_zip}`}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-1)' }}>
          {error && (
            <span style={{ fontSize: 'var(--text-xs)', color: '#c15439' }}>{error}</span>
          )}
          <button
            className="btn-primary"
            onClick={e => { e.stopPropagation(); handleAccept() }}
            disabled={pending}
            style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2) var(--space-5)' }}
          >
            {pending ? 'Accepting…' : 'Accept Case →'}
          </button>
        </div>
      </div>
    </div>
  )
}
