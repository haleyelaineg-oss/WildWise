import type { CaseStatus } from '@/types'

export const ANIMAL_LABELS: Record<string, string> = {
  raccoon:       'Raccoon',
  opossum:       'Opossum',
  deer:          'Deer or Fawn',
  squirrel:      'Squirrel',
  rabbit:        'Rabbit',
  groundhog:     'Groundhog',
  chipmunk:      'Chipmunk',
  mouse:         'Mouse or Vole',
  skunk:         'Skunk',
  bat:           'Bat',
  fox:           'Fox',
  mammal_unsure: 'Unknown Mammal',
  songbird:      'Songbird',
  raptor:        'Raptor',
  duck:          'Duck or Goose',
  large_bird:    'Large Bird',
  other_bird:    'Bird (unknown)',
  turtle:        'Turtle',
  snake:         'Snake',
  frog:          'Frog or Toad',
  other_reptile: 'Reptile (unknown)',
  other:         'Unknown Animal',
}

export const CONDITION_LABELS: Record<string, string> = {
  injured:    'Injured / Sick',
  concerning: 'Concerning Behavior',
  displaced:  'Displaced',
  no_mom:     'No Sign of Mom',
  separated:  'Not with Mom',
}

export const AGE_LABELS: Record<string, string> = {
  infant:     'Infant',
  very_young: 'Very Young',
  adult:      'Adult',
}

export const STATUS_CONFIG: Record<CaseStatus, { label: string; color: string; bg: string }> = {
  open:                     { label: 'Open · Pending Acceptance', color: 'var(--color-navy)',       bg: 'rgba(27,51,73,0.08)' },
  accepted:                 { label: 'Accepted by Rehabber',    color: 'var(--color-olive)',      bg: 'rgba(103,133,83,0.12)' },
  pending_transport:        { label: 'Pending Transport',        color: 'var(--color-steel)',      bg: 'rgba(51,101,138,0.12)' },
  transport_secured:        { label: 'Transport Secured',        color: 'var(--color-steel)',      bg: 'rgba(51,101,138,0.18)' },
  en_route:                 { label: 'En Route',                 color: '#7a5c00',                 bg: 'rgba(200,160,0,0.12)' },
  in_care:                  { label: 'In Care',                  color: 'var(--color-olive)',      bg: 'rgba(103,133,83,0.18)' },
  assigned_to_sub_permittee:{ label: 'With Sub-Permittee',       color: 'var(--color-olive)',      bg: 'rgba(103,133,83,0.10)' },
  pending_release:          { label: 'Pending Release',          color: '#7a5c00',                 bg: 'rgba(200,160,0,0.10)' },
  unreleasable:             { label: 'Unreleasable',             color: 'var(--color-text-muted)', bg: 'rgba(0,0,0,0.06)' },
  did_not_make_it:          { label: 'Did Not Make It',          color: '#c15439',                 bg: 'rgba(193,84,57,0.08)' },
  resolved:                 { label: 'Resolved',                 color: 'var(--color-olive)',      bg: 'rgba(103,133,83,0.15)' },
  closed:                   { label: 'Closed',                   color: 'var(--color-text-muted)', bg: 'rgba(0,0,0,0.08)' },
}

export function formatAnimal(species: string | null, detail: string | null): string {
  if (!species) return 'Unknown Animal'
  if (species === 'other_mammal' && detail) {
    return detail.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }
  return ANIMAL_LABELS[species] ?? species
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
