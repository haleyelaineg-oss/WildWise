'use client'

import React, { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCaseStatus, assignToSubPermittee, transferCase, closeCase } from '../cases/actions'
import {
  formatAnimal, timeAgo,
  AGE_LABELS, CONDITION_LABELS, STATUS_CONFIG,
} from './caseUtils'
import type { WildlifeCase, CaseStatus } from '@/types'

interface Person { id: string; display_name: string | null }

interface Props {
  cases: WildlifeCase[]
  subPermittees?: Person[]
  rehabbers?: Person[]
}

export default function MyCasesTable({ cases, subPermittees = [], rehabbers = [] }: Props) {
  if (cases.length === 0) {
    return (
      <div className="card" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
        You haven&apos;t accepted any cases yet.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {cases.map(c => <CaseRow key={c.id} c={c} subPermittees={subPermittees} rehabbers={rehabbers} />)}
    </div>
  )
}

const STATUS_OPTIONS: { status: CaseStatus; label: string }[] = [
  { status: 'open',                      label: 'Return to Open' },
  { status: 'accepted',                  label: 'Accepted by Rehabber' },
  { status: 'pending_transport',         label: 'Pending Transport' },
  { status: 'transport_secured',         label: 'Transport Secured' },
  { status: 'en_route',                  label: 'En Route' },
  { status: 'in_care',                   label: 'In Care' },
  { status: 'assigned_to_sub_permittee', label: 'With Sub-Permittee' },
  { status: 'pending_release',           label: 'Pending Release' },
  { status: 'reunite_pending',           label: 'Reunite Pending' },
  { status: 'reunite_attempt_failed',    label: 'Reunite Attempt Failed' },
  { status: 'resolved',                  label: 'Resolved' },
  { status: 'deceased',                  label: 'Did Not Make It' },
  { status: 'closed',                    label: 'Closed' },
]

const CLOSE_REASONS: { reason: string; status: CaseStatus; label: string }[] = [
  { reason: 'reunited_with_mom',     status: 'resolved',     label: 'Reunited with Mom' },
  { reason: 'released_to_wild',      status: 'resolved',     label: 'Released to Wild' },
  { reason: 'died_with_finder',      status: 'deceased',     label: 'Died with Finder' },
  { reason: 'died_in_transit',       status: 'deceased',     label: 'Died in Transit' },
  { reason: 'died_in_rehabber_care', status: 'deceased',     label: 'Died in Rehabber Care' },
  { reason: 'humanely_euthanized',   status: 'deceased',     label: 'Humanely Euthanized' },
  { reason: 'unreleasable',          status: 'unreleasable', label: 'Unreleasable' },
  { reason: 'finder_unreachable',    status: 'closed',       label: 'Finder Unreachable' },
  { reason: 'animal_not_found',      status: 'closed',       label: 'Can No Longer Find Animal' },
  { reason: 'duplicate_case',        status: 'closed',       label: 'Duplicate Case' },
  { reason: 'invalid_report',        status: 'closed',       label: 'Invalid Report' },
]

function CaseRow({ c, subPermittees, rehabbers }: { c: WildlifeCase; subPermittees: Person[]; rehabbers: Person[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [showTransportModal, setShowTransportModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [selectedSub, setSelectedSub] = useState('')
  const [selectedRehabber, setSelectedRehabber] = useState('')
  const [selectedCloseReason, setSelectedCloseReason] = useState('')
  const [assignError, setAssignError] = useState<string | null>(null)
  const status = STATUS_CONFIG[c.status]

  function handleStatus(newStatus: CaseStatus) {
    startTransition(async () => {
      await updateCaseStatus(c.id, newStatus)
    })
  }

  function handleRequestTransport() {
    startTransition(async () => {
      await updateCaseStatus(c.id, 'pending_transport')
      setShowTransportModal(false)
    })
  }

  function handleAssignSub() {
    if (!selectedSub) return
    setAssignError(null)
    startTransition(async () => {
      const result = await assignToSubPermittee(c.id, selectedSub)
      if (result.error) { setAssignError(result.error); return }
      setShowAssignModal(false)
      setSelectedSub('')
    })
  }

  function handleTransfer() {
    if (!selectedRehabber) return
    setAssignError(null)
    startTransition(async () => {
      const result = await transferCase(c.id, selectedRehabber)
      if (result.error) { setAssignError(result.error); return }
      setShowAssignModal(false)
      setSelectedRehabber('')
    })
  }

  function handleCloseCase() {
    if (!selectedCloseReason) return
    const reason = CLOSE_REASONS.find(r => r.reason === selectedCloseReason)
    if (!reason) return

    setAssignError(null)
    startTransition(async () => {
      const result = await closeCase(c.id, selectedCloseReason, reason.status)
      if (result.error) { setAssignError(result.error); return }
      setShowCloseModal(false)
      setSelectedCloseReason('')
    })
  }

  const isTerminal = c.status === 'unreleasable' || c.status === 'deceased'
  const needsTransport = c.status === 'accepted'

  return (
    <div
      className="card"
      onClick={() => router.push(`/dashboard/cases/${c.id}`)}
      style={{
        borderLeft: c.is_urgent ? '4px solid #c15439' : '4px solid var(--color-olive)',
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)', flexShrink: 0 }}>
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
          {!isTerminal && (
            <select
              className="form-input"
              value=""
              disabled={pending}
              onClick={e => e.stopPropagation()}
              onChange={e => {
                const val = e.target.value as CaseStatus
                if (val) handleStatus(val)
              }}
              style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-2)', minWidth: 140 }}
            >
              <option value="" disabled>Update status…</option>
              {STATUS_OPTIONS.filter(o => o.status !== c.status).map(({ status: s, label }) => (
                <option key={s} value={s}>{label}</option>
              ))}
            </select>
          )}
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
          <button
            className="btn-secondary"
            onClick={e => { e.stopPropagation(); setShowCloseModal(true); setAssignError(null) }}
            disabled={pending}
            style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-4)', background: '#c15439', color: 'white', borderColor: '#c15439' }}
          >
            Close Case
          </button>
        )}
      </div>

      {/* Transport modal */}
      {showTransportModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'var(--space-6)',
          }}
          onClick={e => { e.stopPropagation(); if (e.target === e.currentTarget) setShowTransportModal(false) }}
        >
          <div className="card" style={{ maxWidth: 480, width: '100%' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)', marginBottom: 'var(--space-2)' }}>
              Arrange Transportation
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
              {formatAnimal(c.animal_species, c.animal_detail)}
              {c.current_zip ? ` · Pickup ZIP: ${c.current_zip}` : c.found_zip ? ` · ZIP: ${c.found_zip}` : ''}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>

              {/* Finder drop-off option */}
              {c.finder_can_transport && (
                <div
                  className="card"
                  style={{ background: 'rgba(103,133,83,0.06)', border: '1px solid rgba(103,133,83,0.3)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                    <strong style={{ color: 'var(--color-navy)', fontSize: 'var(--text-sm)' }}>Finder Drop-Off</strong>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-olive)', fontWeight: 600 }}>
                      Finder can transport{c.finder_transport_miles ? ` up to ${c.finder_transport_miles} mi` : ''}
                    </span>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', maxWidth: 'none', marginBottom: 'var(--space-3)' }}>
                    The finder indicated they can bring the animal to you.
                    Contact them to coordinate a drop-off time and address.
                  </p>
                  {(c.finder_name || c.finder_phone) && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-navy)' }}>
                      {c.finder_name && <div><strong>Name:</strong> {c.finder_name}</div>}
                      {c.finder_phone && <div><strong>Phone:</strong> {c.finder_phone}</div>}
                    </div>
                  )}
                </div>
              )}

              {/* Request volunteer transport */}
              <div className="card" style={{ border: '1px solid var(--color-border)' }}>
                <strong style={{ color: 'var(--color-navy)', fontSize: 'var(--text-sm)', display: 'block', marginBottom: 'var(--space-2)' }}>
                  Request Transport Volunteer
                </strong>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', maxWidth: 'none', marginBottom: 'var(--space-3)' }}>
                  {c.finder_can_transport === false
                    ? 'The finder is not able to transport. A transport volunteer will be notified to arrange pickup.'
                    : 'Request a transport volunteer to pick up the animal and bring it to you.'}
                </p>
                <button
                  className="btn-primary"
                  onClick={e => { e.stopPropagation(); handleRequestTransport() }}
                  disabled={pending}
                  style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-4)' }}
                >
                  {pending ? 'Updating…' : 'Request Transport →'}
                </button>
              </div>
            </div>

            <button
              onClick={e => { e.stopPropagation(); setShowTransportModal(false) }}
              style={{ marginTop: 'var(--space-5)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Assign Case modal */}
      {showAssignModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'var(--space-6)',
          }}
          onClick={e => { e.stopPropagation(); if (e.target === e.currentTarget) setShowAssignModal(false) }}
        >
          <div className="card" style={{ maxWidth: 480, width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)', marginBottom: 'var(--space-1)' }}>
                Assign Case
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                {formatAnimal(c.animal_species, c.animal_detail)}
              </p>
            </div>

            {assignError && (
              <p style={{ fontSize: 'var(--text-xs)', color: '#c15439' }}>{assignError}</p>
            )}

            {/* Sub-permittee assignment */}
            {subPermittees.length > 0 && (
              <div className="card" style={{ border: '1px solid var(--color-border)' }}>
                <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-navy)', display: 'block', marginBottom: 'var(--space-2)' }}>
                  Assign to Sub-Permittee
                </strong>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', maxWidth: 'none', marginBottom: 'var(--space-3)' }}>
                  The case stays in your caseload. The sub-permittee will be able to manage and update it.
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <select
                    className="form-input"
                    value={selectedSub}
                    onClick={e => e.stopPropagation()}
                    onChange={e => setSelectedSub(e.target.value)}
                    style={{ flex: 1, fontSize: 'var(--text-xs)' }}
                  >
                    <option value="">Select sub-permittee…</option>
                    {subPermittees.map(p => (
                      <option key={p.id} value={p.id}>{p.display_name ?? p.id.slice(0, 8)}</option>
                    ))}
                  </select>
                  <button
                    className="btn-primary"
                    onClick={e => { e.stopPropagation(); handleAssignSub() }}
                    disabled={!selectedSub || pending}
                    style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-4)', flexShrink: 0 }}
                  >
                    {pending ? 'Assigning…' : 'Assign'}
                  </button>
                </div>
              </div>
            )}

            {/* Transfer to another rehabber */}
            {rehabbers.length > 0 && (
              <div className="card" style={{ border: '1px solid var(--color-border)' }}>
                <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-navy)', display: 'block', marginBottom: 'var(--space-2)' }}>
                  Transfer to Another Rehabber
                </strong>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', maxWidth: 'none', marginBottom: 'var(--space-3)' }}>
                  Fully transfers the case. It will leave your caseload and appear in the other rehabber's My Cases.
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <select
                    className="form-input"
                    value={selectedRehabber}
                    onClick={e => e.stopPropagation()}
                    onChange={e => setSelectedRehabber(e.target.value)}
                    style={{ flex: 1, fontSize: 'var(--text-xs)' }}
                  >
                    <option value="">Select rehabber…</option>
                    {rehabbers.map(p => (
                      <option key={p.id} value={p.id}>{p.display_name ?? p.id.slice(0, 8)}</option>
                    ))}
                  </select>
                  <button
                    className="btn-secondary"
                    onClick={e => { e.stopPropagation(); handleTransfer() }}
                    disabled={!selectedRehabber || pending}
                    style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-4)', flexShrink: 0 }}
                  >
                    {pending ? 'Transferring…' : 'Transfer'}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={e => { e.stopPropagation(); setShowAssignModal(false) }}
              style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', alignSelf: 'flex-start' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Close Case modal */}
      {showCloseModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'var(--space-6)',
          }}
          onClick={e => { e.stopPropagation(); if (e.target === e.currentTarget) setShowCloseModal(false) }}
        >
          <div className="card" style={{ maxWidth: 480, width: '100%' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)', marginBottom: 'var(--space-2)' }}>
              Close Case
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
              {formatAnimal(c.animal_species, c.animal_detail)}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                Reason for closing:
              </label>
              <select
                className="form-input"
                value={selectedCloseReason}
                onClick={e => e.stopPropagation()}
                onChange={e => setSelectedCloseReason(e.target.value)}
              >
                <option value="">Select a reason…</option>
                {CLOSE_REASONS.map(({ reason, label }) => (
                  <option key={reason} value={reason}>{label}</option>
                ))}
              </select>

              {assignError && (
                <p style={{ color: '#c15439', fontSize: 'var(--text-sm)' }}>
                  {assignError}
                </p>
              )}

              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                <button
                  onClick={e => { e.stopPropagation(); setShowCloseModal(false) }}
                  style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={e => { e.stopPropagation(); handleCloseCase() }}
                  disabled={!selectedCloseReason || pending}
                  style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2) var(--space-4)' }}
                >
                  {pending ? 'Closing…' : 'Close Case'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
