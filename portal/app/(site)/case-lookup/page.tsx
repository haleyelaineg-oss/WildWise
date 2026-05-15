'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatAnimal, timeAgo } from '@/app/dashboard/_components/caseUtils'
import type { WildlifeCase } from '@/types'

interface CaseNote {
  id: string
  created_at: string
  note: string
  note_type: 'finder_update' | 'rehabber_note' | 'system_note'
  author_name: string | null
  author_contact: string | null
}

export default function CaseLookup() {
  const [caseId, setCaseId] = useState('')
  const [caseData, setCaseData] = useState<WildlifeCase | null>(null)
  const [caseNotes, setCaseNotes] = useState<CaseNote[]>([])
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function lookupCase(e: React.FormEvent) {
    e.preventDefault()
    if (!caseId.trim()) return

    setLoading(true)
    setError('')
    setCaseData(null)
    setCaseNotes([])

    try {
      const supabase = createClient()

      // Get case data
      const { data: caseResult, error: caseError } = await supabase
        .from('wildlife_cases')
        .select('*')
        .eq('id', caseId.trim())
        .single()

      if (caseError) {
        setError('Case not found. Please check the Case ID and try again.')
        return
      }

      setCaseData(caseResult)

      // Get case notes
      const { data: notesResult, error: notesError } = await supabase
        .from('wildlife_case_notes')
        .select('*')
        .eq('case_id', caseId.trim())
        .order('created_at', { ascending: false })

      if (!notesError && notesResult) {
        setCaseNotes(notesResult)
      }
    } catch {
      setError('An error occurred while looking up the case.')
    } finally {
      setLoading(false)
    }
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault()
    if (!newNote.trim() || !caseData) return

    setSubmitting(true)
    try {
        const supabase = createClient()

        const { error } = await supabase
          .from('wildlife_case_notes')
          .insert({
            case_id: caseData.id,
            note: newNote.trim(),
            note_type: 'finder_update',
          })

        if (error) {
          setError('Failed to add note. Please try again.')
          return
        }

        // Refresh notes
        const { data: notesResult } = await supabase
          .from('wildlife_case_notes')
          .select('*')
          .eq('case_id', caseData.id)
          .order('created_at', { ascending: false })

        if (notesResult) {
          setCaseNotes(notesResult)
        }

        setNewNote('')
        setError('')
      } catch {
        setError('An error occurred while adding the note.')
      } finally {
        setSubmitting(false)
      }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-6)' }}>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-3xl)',
        color: 'var(--color-navy)',
        marginBottom: 'var(--space-2)',
        textAlign: 'center'
      }}>
        Track Your Case
      </h1>
      <p style={{
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        marginBottom: 'var(--space-8)',
        fontSize: 'var(--text-lg)'
      }}>
        Enter your Case ID to check the status and add updates
      </p>

      {/* Case ID Lookup Form */}
      <form onSubmit={lookupCase} style={{
        background: 'white',
        padding: 'var(--space-6)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: 'var(--space-6)'
      }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label
              htmlFor="caseId"
              style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--color-navy)',
                marginBottom: 'var(--space-2)'
              }}
            >
              Case ID
            </label>
            <input
              id="caseId"
              type="text"
              value={caseId}
              onChange={e => setCaseId(e.target.value)}
              placeholder="e.g. abc123de-456f-7890-abcd-ef1234567890"
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-base)',
                fontFamily: 'monospace'
              }}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !caseId.trim()}
            style={{
              padding: 'var(--space-3) var(--space-6)',
              background: 'var(--color-olive)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-base)',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Searching…' : 'Look Up Case'}
          </button>
        </div>
      </form>

      {error && (
        <div style={{
          background: 'rgba(193,84,57,0.08)',
          border: '1px solid #c15439',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
          color: '#c15439'
        }}>
          {error}
        </div>
      )}

      {/* Case Details */}
      {caseData && (
        <div style={{
          background: 'white',
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: 'var(--space-6)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 'var(--space-4)',
            flexWrap: 'wrap',
            gap: 'var(--space-3)'
          }}>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-xl)',
                color: 'var(--color-navy)',
                marginBottom: 'var(--space-1)'
              }}>
                {formatAnimal(caseData.animal_species, caseData.animal_detail)}
              </h2>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)'
              }}>
                Reported {timeAgo(caseData.created_at)}
              </p>
            </div>
            <div style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 999,
              color: 'var(--color-olive)',
              background: 'rgba(103,133,83,0.12)'
            }}>
              {caseData.status.replace(/_/g, ' ').toUpperCase()}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)'
          }}>
            <div>
              <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-navy)' }}>Location</strong>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                ZIP: {caseData.found_zip}
                {caseData.current_zip && ` → ${caseData.current_zip}`}
              </p>
            </div>
            {caseData.finder_name && (
              <div>
                <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-navy)' }}>Finder</strong>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  {caseData.finder_name}
                </p>
              </div>
            )}
          </div>

          {/* Case Notes */}
          <div style={{ marginTop: 'var(--space-6)' }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-lg)',
              color: 'var(--color-navy)',
              marginBottom: 'var(--space-4)'
            }}>
              Case Updates
            </h3>

            {caseNotes.length === 0 ? (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                No updates yet. Check back later for status updates from rehabbers.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {caseNotes.map(note => (
                  <div key={note.id} style={{
                    padding: 'var(--space-4)',
                    background: 'rgba(51,101,138,0.04)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '3px solid var(--color-steel)'
                  }}>
                    <div style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                      marginBottom: 'var(--space-2)'
                    }}>
                      {timeAgo(note.created_at)}
                      {note.author_name && ` · ${note.author_name}`}
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-navy)', margin: 0 }}>
                      {note.note}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Note Form */}
            <form onSubmit={addNote} style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-4)',
              background: 'rgba(103,133,83,0.04)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(103,133,83,0.2)'
            }}>
              <label
                htmlFor="newNote"
                style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: 'var(--color-navy)',
                  marginBottom: 'var(--space-2)'
                }}
              >
                Add an Update
              </label>
              <textarea
                id="newNote"
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Share any updates about the animal's condition or situation..."
                rows={3}
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  resize: 'vertical',
                  marginBottom: 'var(--space-3)'
                }}
                required
              />
              <button
                type="submit"
                disabled={submitting || !newNote.trim()}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  background: 'var(--color-olive)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1
                }}
              >
                {submitting ? 'Adding…' : 'Add Update'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}