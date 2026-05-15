'use client'

import { useState, Fragment } from 'react'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { createClient } from '@/lib/supabase/client'

const DNR_REHABBER_URL = 'https://www.michigan.gov/dnr/managing-resources/wildlife/injured-wildlife'

const MICHIGAN_COUNTIES = [
  'Alcona','Alger','Allegan','Alpena','Antrim','Arenac','Baraga','Barry','Bay','Benzie',
  'Berrien','Branch','Calhoun','Cass','Charlevoix','Cheboygan','Chippewa','Clare','Clinton',
  'Crawford','Delta','Dickinson','Eaton','Emmet','Genesee','Gladwin','Gogebic','Grand Traverse',
  'Gratiot','Hillsdale','Houghton','Huron','Ingham','Ionia','Iosco','Iron','Isabella','Jackson',
  'Kalamazoo','Kalkaska','Kent','Keweenaw','Lake','Lapeer','Leelanau','Lenawee','Livingston',
  'Luce','Mackinac','Macomb','Manistee','Marquette','Mason','Mecosta','Menominee','Midland',
  'Missaukee','Monroe','Montcalm','Montmorency','Muskegon','Newaygo','Oakland','Oceana','Ogemaw',
  'Ontonagon','Osceola','Oscoda','Otsego','Ottawa','Presque Isle','Roscommon','Saginaw',
  'St. Clair','St. Joseph','Sanilac','Schoolcraft','Shiawassee','Tuscola','Van Buren',
  'Washtenaw','Wayne','Wexford',
]

/* ── Types ───────────────────────────────────────────────────────────────── */

type AnimalSpecies =
  | 'raccoon' | 'opossum' | 'deer' | 'squirrel' | 'rabbit' | 'groundhog'
  | 'chipmunk' | 'mouse' | 'skunk' | 'bat' | 'fox'
  | 'other_mammal' | 'mammal_unsure'
  | 'songbird' | 'raptor' | 'duck' | 'large_bird' | 'other_bird'
  | 'turtle' | 'snake' | 'frog' | 'other_reptile'
  | 'other'

type AnimalAge = 'infant' | 'very_young' | 'adult' | 'unsure'
type Condition = 'injured' | 'concerning' | 'displaced' | 'no_mom' | 'separated'
type Step = 'disclaimer' | 'animal' | 'age' | 'condition' | 'location' | 'results'
type Category = 'mammal' | 'bird' | 'reptile' | 'other'

interface Selections {
  animal?: AnimalSpecies
  animalDetail?: string
  age?: AnimalAge
  conditions?: Condition[]
  conditionDesc?: string
  injurySymptoms?: string[]
  noMomTime?: string
  momStatus?: string
  foundZip?: string
  currentZip?: string
  pickupStreet?: string
  pickupCity?: string
  pickupZip?: string
}

interface AnimalOption {
  key: string
  species: AnimalSpecies
  detail?: string
  label: string
  description?: string
}

interface ConditionConfig {
  key: Condition
  label: string
  badge?: string
  description: string
  note?: string
}

/* ── Animal option lists ─────────────────────────────────────────────────── */

const MAMMAL_OPTIONS: AnimalOption[] = [
  { key: 'badger',         species: 'other_mammal', detail: 'badger',         label: 'Badger' },
  { key: 'bat',            species: 'bat',          label: 'Bat' },
  { key: 'beaver',         species: 'other_mammal', detail: 'beaver',         label: 'Beaver' },
  { key: 'black_bear',     species: 'other_mammal', detail: 'black_bear',     label: 'Black Bear' },
  { key: 'bobcat',         species: 'other_mammal', detail: 'bobcat',         label: 'Bobcat' },
  { key: 'chipmunk',       species: 'chipmunk',     label: 'Chipmunk' },
  { key: 'coyote',         species: 'other_mammal', detail: 'coyote',         label: 'Coyote' },
  { key: 'deer',           species: 'deer',         label: 'Deer or Fawn' },
  { key: 'elk',            species: 'other_mammal', detail: 'elk',            label: 'Elk' },
  { key: 'flying_squirrel',species: 'other_mammal', detail: 'flying_squirrel',label: 'Flying Squirrel' },
  { key: 'fox',            species: 'fox',          label: 'Fox' },
  { key: 'wolf',           species: 'other_mammal', detail: 'wolf',           label: 'Gray Wolf' },
  { key: 'groundhog',      species: 'groundhog',    label: 'Groundhog' },
  { key: 'mink',           species: 'other_mammal', detail: 'mink',           label: 'Mink' },
  { key: 'mole',           species: 'other_mammal', detail: 'mole',           label: 'Mole' },
  { key: 'moose',          species: 'other_mammal', detail: 'moose',          label: 'Moose' },
  { key: 'mouse',          species: 'mouse',        label: 'Mouse or Vole' },
  { key: 'muskrat',        species: 'other_mammal', detail: 'muskrat',        label: 'Muskrat' },
  { key: 'opossum',        species: 'opossum',      label: 'Opossum' },
  { key: 'porcupine',      species: 'other_mammal', detail: 'porcupine',      label: 'Porcupine' },
  { key: 'rabbit',         species: 'rabbit',       label: 'Rabbit' },
  { key: 'raccoon',        species: 'raccoon',      label: 'Raccoon' },
  { key: 'rat',            species: 'other_mammal', detail: 'rat',            label: 'Rat' },
  { key: 'red_squirrel',   species: 'other_mammal', detail: 'red_squirrel',   label: 'Red Squirrel' },
  { key: 'river_otter',    species: 'other_mammal', detail: 'river_otter',    label: 'River Otter' },
  { key: 'shrew',          species: 'other_mammal', detail: 'shrew',          label: 'Shrew' },
  { key: 'skunk',          species: 'skunk',        label: 'Skunk' },
  { key: 'squirrel',       species: 'squirrel',     label: 'Squirrel' },
  { key: 'weasel',         species: 'other_mammal', detail: 'weasel',         label: 'Weasel' },
  { key: 'mammal_unsure',  species: 'mammal_unsure',                          label: 'Not sure / Other' },
]

const BIRD_OPTIONS: AnimalOption[] = [
  { key: 'songbird',   species: 'songbird',   label: 'Songbird',    description: 'robin, sparrow, starling, blue jay, cardinal…' },
  { key: 'raptor',     species: 'raptor',     label: 'Raptor',      description: 'hawk, owl, eagle, falcon' },
  { key: 'duck',       species: 'duck',       label: 'Duck or Goose' },
  { key: 'large_bird', species: 'large_bird', label: 'Large Bird',  description: 'heron, crane, turkey, woodpecker' },
  { key: 'other_bird', species: 'other_bird', label: 'Other / Not sure' },
]

const REPTILE_OPTIONS: AnimalOption[] = [
  { key: 'turtle',        species: 'turtle',       label: 'Turtle' },
  { key: 'snake',         species: 'snake',        label: 'Snake' },
  { key: 'frog',          species: 'frog',         label: 'Frog or Toad' },
  { key: 'other_reptile', species: 'other_reptile',label: 'Other / Not sure' },
]

const CATEGORIES: { key: Category; label: string; hint: string }[] = [
  { key: 'mammal',  label: 'Mammal',               hint: 'mammal, rodent, or other furry friend' },
  { key: 'bird',    label: 'Bird',                  hint: 'songbird, raptor, duck, heron…' },
  { key: 'reptile', label: 'Reptile or Amphibian',  hint: 'turtle, snake, frog or toad' },
  { key: 'other',   label: 'Not Sure / Other',      hint: 'I\'m not sure what I found' },
]

const CATEGORY_OPTIONS: Record<Exclude<Category, 'other'>, AnimalOption[]> = {
  mammal:  MAMMAL_OPTIONS,
  bird:    BIRD_OPTIONS,
  reptile: REPTILE_OPTIONS,
}

/* ── Condition configs ───────────────────────────────────────────────────── */

const INJURY_SYMPTOMS = [
  'Bleeding or open wound',
  'Lethargic',
  'Broken or dragging limb',
  'Cannot stand or move',
  'Hit by a vehicle',
  'Labored or open-mouth breathing',
  'Eyes closed or swollen shut',
  'Maggots or flies visible',
  'Seizures or trembling',
  'Apparent paralysis',
  'Dog or cat attack',
  'Caught in netting, wire, or trap',
  'Wing or limb hanging abnormally',
  'Other visible injury or illness',
]

const ADULT_CONDITIONS: ConditionConfig[] = [
  {
    key: 'concerning',
    label: 'Concerning behavior or appearance',
    description: 'No visible injuries, but sitting still, not moving away, lethargic, acting strange, or something just doesn\'t look right',
  },
  {
    key: 'displaced',
    label: 'Found in an unusual place',
    description: 'Inside a building, on a busy road, or far from natural habitat',
    note: 'Note: this tool is for injured and orphaned wildlife, not for relocating nuisance animals.',
  },
]

const YOUNG_CONDITIONS: ConditionConfig[] = [
  {
    key: 'no_mom',
    label: 'No Sign of Mom',
    description: 'Mom hasn\'t returned for an extended period or may be deceased',
  },
  {
    key: 'displaced',
    label: 'Found in an unusual place',
    description: 'Inside a building, on a busy road, or exposed in the open',
    note: 'Note: this tool is for injured and orphaned wildlife, not for relocating nuisance animals.',
  },
]

/* ── Safety notes ────────────────────────────────────────────────────────── */

const ANIMAL_NOTES: Partial<Record<AnimalSpecies, { urgent: boolean; text: string }>> = {
  bat: {
    urgent: true,
    text: 'Bats are a rabies vector species. Do not handle with bare hands under any circumstances — use thick leather gloves or a folded towel. Even a scratch or small bite requires medical evaluation.',
  },
  skunk: {
    urgent: false,
    text: 'Approach slowly and avoid startling the animal. If possible, give it space to move away on its own before attempting to contain it.',
  },
  snake: {
    urgent: false,
    text: 'Do not handle any snake unless you can confirm it is non-venomous. Michigan has one venomous species — the Eastern Massasauga rattlesnake.',
  },
}

const OTHER_MAMMAL_NOTES: Record<string, { urgent: boolean; text: string }> = {
  coyote: {
    urgent: false,
    text: 'Healthy coyotes rarely need intervention. If it appears injured or in immediate danger, contact a rehabber before approaching.',
  },
  bobcat: {
    urgent: true,
    text: 'Do not attempt to handle a bobcat. Contact a licensed rehabber or the DNR before approaching the animal.',
  },
  black_bear: {
    urgent: true,
    text: 'Do not approach or attempt to contain a bear yourself. Keep your distance and call the DNR immediately at 1-800-292-7800.',
  },
}

/* ── Stepper config ──────────────────────────────────────────────────────── */

const STEPPER_STEPS: { key: Step; label: string }[] = [
  { key: 'animal',    label: 'Type of Animal' },
  { key: 'age',       label: 'Age' },
  { key: 'condition', label: "What's Wrong" },
  { key: 'location',  label: 'Location' },
]

/* ── Component ───────────────────────────────────────────────────────────── */

export default function DecisionTree() {
  const [step, setStep] = useState<Step>('disclaimer')
  const [selections, setSelections] = useState<Selections>({})

  // Step 1: category + specific animal
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedSpecificKey, setSelectedSpecificKey] = useState('')
  const [otherAnimalDesc, setOtherAnimalDesc] = useState('')

  // Step 2 pending selection
  const [pendingAge, setPendingAge] = useState<AnimalAge | null>(null)

  // Step 3: multi-select conditions + follow-ups
  const [selectedConditions, setSelectedConditions] = useState<Set<Condition>>(new Set())
  const [injurySymptoms, setInjurySymptoms] = useState<string[]>([])
  const [noMomTime, setNoMomTime] = useState('')
  const [momStatus, setMomStatus] = useState('')
  const [conditionDesc, setConditionDesc] = useState('')

  // Step 4 state
  const [foundZip, setFoundZip] = useState('')
  const [foundCounty, setFoundCounty] = useState('')
  const [currentZip, setCurrentZip] = useState('')
  const [finderName, setFinderName] = useState('')
  const [finderPhone, setFinderPhone] = useState('')
  const [finderCanTransport, setFinderCanTransport] = useState<boolean | null>(null)
  const [finderTransportMiles, setFinderTransportMiles] = useState<number | null>(null)
  const [pickupStreet, setPickupStreet] = useState('')
  const [pickupCity, setPickupCity] = useState('')
  const [pickupZip, setPickupZip] = useState('')

  const [acknowledged, setAcknowledged] = useState(false)
  const [showAckError, setShowAckError] = useState(false)

  // Results escalation state
  const [escalating, setEscalating] = useState(false)
  const [escalated, setEscalated] = useState(false)
  const [escalateReason, setEscalateReason] = useState('')
  const [escalateTime, setEscalateTime] = useState('')
  const [escalateNotes, setEscalateNotes] = useState('')

  // Submission state
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [caseId, setCaseId] = useState<string | null>(null)

  const stepIndex = STEPPER_STEPS.findIndex(s => s.key === step)
  const isYoungAnimal = selections.age === 'infant' || selections.age === 'very_young'
  const activeConditions = isYoungAnimal ? YOUNG_CONDITIONS : ADULT_CONDITIONS

  function goBack() {
    const prev: Partial<Record<Step, Step>> = {
      animal: 'disclaimer',
      age: 'animal',
      condition: 'age',
      location: 'condition',
    }
    if (step === 'condition') setSelectedConditions(new Set())
    setStep(prev[step] ?? 'disclaimer')
  }

  function restart() {
    setStep('disclaimer')
    setSelections({})
    setSelectedCategory(null)
    setSelectedSpecificKey('')
    setOtherAnimalDesc('')
    setPendingAge(null)
    setSelectedConditions(new Set())
    setInjurySymptoms([])
    setNoMomTime('')
    setMomStatus('')
    setConditionDesc('')
    setFoundZip('')
    setFoundCounty('')
    setCurrentZip('')
    setFinderName('')
    setFinderPhone('')
    setFinderCanTransport(null)
    setFinderTransportMiles(null)
    setPickupStreet('')
    setPickupCity('')
    setPickupZip('')
    setAcknowledged(false)
    setShowAckError(false)
    setEscalating(false)
    setEscalated(false)
    setEscalateReason('')
    setEscalateTime('')
    setEscalateNotes('')
    setSubmitting(false)
    setSubmitError('')
    setCaseId(null)
  }

  function selectAnimal(value: AnimalSpecies, detail?: string) {
    setSelections(s => ({ ...s, animal: value, animalDetail: detail }))
    setStep('age')
  }

  function handleAnimalNext() {
    if (!selectedCategory) return
    if (selectedCategory === 'other') {
      selectAnimal('other', otherAnimalDesc.trim() || undefined)
      return
    }
    if (!selectedSpecificKey) return
    const opt = CATEGORY_OPTIONS[selectedCategory].find(o => o.key === selectedSpecificKey)
    if (opt) selectAnimal(opt.species, opt.detail)
  }

  function selectAge(age: AnimalAge) {
    setSelections(s => ({ ...s, age }))
    setPendingAge(null)
    setStep('condition')
  }

  function toggleCondition(cond: Condition) {
    setSelectedConditions(prev => {
      const next = new Set(prev)
      if (next.has(cond)) {
        next.delete(cond)
      } else {
        next.add(cond)
      }
      return next
    })
  }

  function toggleSymptom(symptom: string) {
    setInjurySymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    )
  }

  function handleConditionSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (selectedConditions.size === 0) return
    setSelections(s => ({
      ...s,
      conditions: Array.from(selectedConditions),
      conditionDesc: conditionDesc.trim() || undefined,
      injurySymptoms: injurySymptoms.length > 0 ? injurySymptoms : undefined,
      noMomTime: selectedConditions.has('no_mom') ? noMomTime.trim() || undefined : undefined,
      momStatus: selectedConditions.has('no_mom') ? momStatus.trim() || undefined : undefined,
    }))
    setStep('location')
  }

  async function handleLocationSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const fz = foundZip.trim()
    if (fz.length !== 5 || !/^\d+$/.test(fz)) return
    const cz = currentZip.trim()

    setSubmitting(true)
    setSubmitError('')

    const isYoungWithNoMom =
      (selections.age === 'infant' || selections.age === 'very_young') &&
      (selections.conditions ?? []).includes('no_mom')

    const noMomUrgent = isYoungWithNoMom && (
      selections.momStatus === 'MomDeceased' ||
      selections.momStatus === 'MomRelocated' ||
      selections.noMomTime === '24–48 hours' ||
      selections.noMomTime === 'Over two days'
    )

    const isUrgent =
      (selections.injurySymptoms ?? []).length > 0 ||
      noMomUrgent

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('wildlife_cases')
      .insert({
        animal_species:  selections.animal     ?? null,
        animal_detail:   selections.animalDetail ?? null,
        animal_age:      selections.age        ?? null,
        conditions:      selections.conditions ?? [],
        injury_symptoms: selections.injurySymptoms ?? [],
        no_mom_time:     selections.noMomTime  ?? null,
        condition_desc:  selections.conditionDesc ?? null,
        found_zip:       fz,
        found_county:    foundCounty.trim() || null,
        current_zip:     cz.length === 5 ? cz : null,
        is_urgent:       isUrgent,
        user_id:         user?.id ?? null,
        finder_name:           finderName.trim() || null,
        finder_phone:          finderPhone.trim() || null,
        finder_can_transport:  finderCanTransport,
        finder_transport_miles: finderCanTransport ? finderTransportMiles : null,
        pickup_street:         !finderCanTransport ? pickupStreet.trim() || null : null,
        pickup_city:           !finderCanTransport ? pickupCity.trim() || null : null,
        pickup_zip:            !finderCanTransport ? pickupZip.trim() || null : null,
      })
      .select('id')
      .single()

    setSubmitting(false)

    if (error) {
      setSubmitError('Something went wrong saving your case. Please try again.')
      return
    }

    setCaseId(data.id)
    setSelections(s => ({ 
      ...s, 
      foundZip: fz, 
      currentZip: cz.length === 5 ? cz : undefined,
      pickupStreet: pickupStreet.trim() || undefined,
      pickupCity: pickupCity.trim() || undefined,
      pickupZip: pickupZip.trim() || undefined
    }))
    setStep('results')
  }

  function handleEscalate(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setEscalated(true)
    setEscalating(false)
  }

  const animalNote =
    selections.animal && ANIMAL_NOTES[selections.animal]
      ? ANIMAL_NOTES[selections.animal]!
      : selections.animal === 'other_mammal' && selections.animalDetail
        ? OTHER_MAMMAL_NOTES[selections.animalDetail] ?? null
        : null

  const isObserveAdvised =
    (selections.conditions ?? []).includes('concerning') && selections.age === 'adult'

  const animalNextDisabled =
    !selectedCategory || (selectedCategory !== 'other' && !selectedSpecificKey)

  /* ── Shared styles ─────────────────────────────────────────────────────── */

  const infoBoxStyle: React.CSSProperties = {
    padding: 'var(--space-5)',
    background: 'rgba(51,101,138,0.06)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
  }

  const bottomNavStyle: React.CSSProperties = {
    display: 'flex',
    gap: 'var(--space-3)',
    alignItems: 'center',
    marginTop: 'var(--space-10)',
    paddingTop: 'var(--space-6)',
    borderTop: '1px solid var(--color-border)',
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

      {/* Progress stepper */}
      {step !== 'disclaimer' && step !== 'results' && (
        <div
          style={{
            background: 'white',
            borderBottom: '1px solid var(--color-border)',
            padding: 'var(--space-5) 0 var(--space-4)',
          }}
        >
          <div
            className="container"
            style={{ maxWidth: 'var(--container-md)', display: 'flex', alignItems: 'flex-start' }}
          >
            {STEPPER_STEPS.map((s, i) => {
              const isCompleted = stepIndex > i
              const isActive = stepIndex === i
              return (
                <Fragment key={s.key}>
                  {i > 0 && (
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        marginTop: 13,
                        background: isCompleted ? 'var(--color-olive)' : 'var(--color-border)',
                        transition: 'background 0.2s',
                      }}
                    />
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 700,
                        flexShrink: 0,
                        background: isCompleted || isActive ? 'var(--color-olive)' : 'var(--color-border)',
                        color: isCompleted || isActive ? 'white' : 'var(--color-text-muted)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {isCompleted ? '✓' : i + 1}
                    </div>
                    <span
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive
                          ? 'var(--color-navy)'
                          : isCompleted
                          ? 'var(--color-olive)'
                          : 'var(--color-text-muted)',
                        textAlign: 'center',
                        maxWidth: 72,
                        lineHeight: 1.3,
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                </Fragment>
              )
            })}
          </div>
        </div>
      )}

      <div
        className="container"
        style={{
          flex: 1,
          paddingTop: 'var(--space-12)',
          paddingBottom: 'var(--space-16)',
          maxWidth: 'var(--container-md)',
        }}
      >
        {/* Back button (top) */}
        {step !== 'disclaimer' && step !== 'results' && (
          <button
            onClick={goBack}
            style={{
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-sm)',
              marginBottom: 'var(--space-6)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            ← Back
          </button>
        )}

        {/* ── DISCLAIMER ───────────────────────────────────────────────────── */}
        {step === 'disclaimer' && (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)', marginBottom: 'var(--space-5)' }}>
              Found an Injured or Orphaned Animal?
            </h2>

            <div
              style={{
                padding: 'var(--space-6)',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(193,84,57,0.07)',
                borderLeft: '4px solid #c15439',
                marginBottom: 'var(--space-5)',
              }}
            >
              <p style={{ fontWeight: 900, fontSize: 'var(--text-lg)', color: '#c15439', marginBottom: 'var(--space-3)', maxWidth: 'none' }}>
                IMPORTANT:
              </p>
              <p style={{ fontWeight: 700, color: '#c15439', marginBottom: 'var(--space-3)', maxWidth: 'none' }}>
               Your safety is the top priority. Please read the following information carefully before proceeding.
              </p>
              <p style={{ color: 'var(--color-navy)', fontSize: 'var(--text-sm)', maxWidth: 'none', marginBottom: 'var(--space-3)' }}>
                Do not interact with or handle an animal until you have received specific guidance from a professional. Handling or caring for wildlife incorrectly,
                even with the best intentions, can cause severe stress, injury, or even death to the animal and can put you and your family at risk.
              </p>
             <p style={{ color: 'var(--color-navy)', fontSize: 'var(--text-sm)', maxWidth: 'none', marginBottom: 'var(--space-3)' }}>
              This tool is designed to provide general guidance and is not a substitute for professional advice or professional assistance in handling wildlife. Each situation is unique, and the best course of action may vary based on specific circumstances.
              </p>
              <p style={{ color: 'var(--color-navy)', fontSize: 'var(--text-sm)', maxWidth: 'none', fontWeight: 600 }}>
                If you choose to handle a wild animal, please be aware of the risk involved. Always wear thick gloves, long sleeves, and long pants, and shoes that offer a layer of protection. It is important to take the proper precautions regardless of age, size, or species.
              </p>
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-3)',
                marginBottom: showAckError ? 'var(--space-2)' : 'var(--space-6)',
                cursor: 'pointer',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${showAckError ? '#c15439' : 'transparent'}`,
                background: showAckError ? 'rgba(193,84,57,0.06)' : 'transparent',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={e => {
                  setAcknowledged(e.target.checked)
                  if (e.target.checked) setShowAckError(false)
                }}
                style={{ marginTop: 3, flexShrink: 0, width: 16, height: 16, accentColor: 'var(--color-olive)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: 'var(--text-sm)', color: showAckError ? '#c15439' : 'var(--color-navy)', fontWeight: showAckError ? 600 : 400 }}>
                I have read and understand the above safety information.
              </span>
            </label>

            {showAckError && (
              <p style={{ fontSize: 'var(--text-xs)', color: '#c15439', marginBottom: 'var(--space-6)' }}>
                Please acknowledge the safety information before continuing.
              </p>
            )}

            <button
              className="btn-primary"
              onClick={() => {
                if (!acknowledged) { setShowAckError(true); return }
                setStep('animal')
              }}
              style={{ marginBottom: 'var(--space-8)' }}
            >
              What to Do Next <ArrowRightIcon style={{ width: 16, height: 16 }} />
            </button>

            <div style={{ ...infoBoxStyle }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', maxWidth: 'none', marginBottom: 'var(--space-3)' }}>
                <strong style={{ color: 'var(--color-navy)' }}>Prefer to call directly?</strong>{' '}
                The Michigan DNR maintains an online directory of licensed wildlife rehabilitators.{' '}
                <a
                  href="https://www.michigan.gov/dnr/managing-resources/wildlife/wildlife-permits/wildlife-rehabilitation-permit-information/directory-of-licensed-wildlife-rehabilitators"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-steel)', fontWeight: 600 }}
                >
                  View the DNR rehabber directory here →
                </a>
              </p>
              <p style={{ fontSize: 'var(--text-sm)', fontStyle: 'italic', color: 'var(--color-text-muted)', maxWidth: 'none' }}>
                *Please note that the DNR public directory does not include all licensed rehabbers in the state. It is an optional listing and
                many rehabbers opt out to protect their personal contact information.
              </p>
            </div>
          </>
        )}

        {/* ── STEP 1: ANIMAL ───────────────────────────────────────────────── */}
        {step === 'animal' && (
          <>
            <span className="section-label">Step 1 of 4</span>
            <h2 style={{ marginTop: 'var(--space-2)', marginBottom: 'var(--space-8)' }}>
              What animal did you find?
            </h2>

            {/* Category picker */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-6)',
              }}
            >
              {CATEGORIES.map(cat => {
                const active = selectedCategory === cat.key
                return (
                  <button
                    key={cat.key}
                    onClick={() => {
                      setSelectedCategory(cat.key)
                      setSelectedSpecificKey('')
                      setOtherAnimalDesc('')
                    }}
                    className="card"
                    style={{
                      textAlign: 'left',
                      padding: 'var(--space-5)',
                      cursor: 'pointer',
                      outline: active ? '2px solid var(--color-olive)' : 'none',
                      outlineOffset: 0,
                      background: active ? 'rgba(103,133,83,0.06)' : undefined,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 'var(--text-base)',
                        color: 'var(--color-navy)',
                        marginBottom: 'var(--space-1)',
                      }}
                    >
                      {cat.label}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {cat.hint}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Specific animal dropdown */}
            {selectedCategory && selectedCategory !== 'other' && (
              <div style={{ marginBottom: 'var(--space-2)' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                  Which {selectedCategory === 'reptile' ? 'reptile or amphibian' : selectedCategory}?
                </label>
                <select
                  className="form-input"
                  value={selectedSpecificKey}
                  onChange={e => setSelectedSpecificKey(e.target.value)}
                  style={{ maxWidth: 380 }}
                >
                  <option value="" disabled>— Select a species —</option>
                  {CATEGORY_OPTIONS[selectedCategory].map(opt => (
                    <option key={opt.key} value={opt.key}>
                      {opt.description ? `${opt.label} — ${opt.description}` : opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* "Other" description field */}
            {selectedCategory === 'other' && (
              <div style={{ marginBottom: 'var(--space-2)' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                  Describe the animal{' '}
                  <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(optional)</span>
                </label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="e.g. large black and white bird, about the size of a crow, found near water…"
                  value={otherAnimalDesc}
                  onChange={e => setOtherAnimalDesc(e.target.value)}
                  style={{ resize: 'vertical', maxWidth: 480 }}
                />
              </div>
            )}

            {/* Bottom navigation */}
            <div style={bottomNavStyle}>
              <button type="button" onClick={goBack} className="btn-secondary">← Back</button>
              <button
                type="button"
                className="btn-primary"
                disabled={animalNextDisabled}
                onClick={handleAnimalNext}
              >
                Next →
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2: AGE ──────────────────────────────────────────────────── */}
        {step === 'age' && (
          <>
            <span className="section-label">Step 2 of 4</span>
            <h2 style={{ marginTop: 'var(--space-2)', marginBottom: 'var(--space-8)' }}>
              How old does the animal appear?
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

              <button
                onClick={() => setPendingAge('infant')}
                className="card"
                style={{
                  textAlign: 'left',
                  padding: 'var(--space-6)',
                  cursor: 'pointer',
                  borderLeft: pendingAge === 'infant' ? '4px solid var(--color-olive)' : '4px solid #c15439',
                  outline: pendingAge === 'infant' ? '2px solid var(--color-olive)' : 'none',
                  outlineOffset: 0,
                }}
              >
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-navy)', fontWeight: 600 }}>
                  Infant
                </span>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)', maxWidth: 'none' }}>
                  No fur or feathers, eyes still closed, clearly newborn or very recently born
                </p>
              </button>

              <button
                onClick={() => setPendingAge('very_young')}
                className="card"
                style={{
                  textAlign: 'left',
                  padding: 'var(--space-6)',
                  cursor: 'pointer',
                  borderLeft: pendingAge === 'very_young' ? '4px solid var(--color-olive)' : '4px solid var(--color-steel)',
                  outline: pendingAge === 'very_young' ? '2px solid var(--color-olive)' : 'none',
                  outlineOffset: 0,
                }}
              >
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-navy)', fontWeight: 600 }}>
                  Very Young
                </span>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)', maxWidth: 'none' }}>
                  Some fur or feathers beginning to appear, eyes recently opened, clearly a small juvenile
                </p>
              </button>

              <button
                onClick={() => setPendingAge('adult')}
                className="card"
                style={{
                  textAlign: 'left',
                  padding: 'var(--space-6)',
                  cursor: 'pointer',
                  borderLeft: pendingAge === 'adult' ? '4px solid var(--color-olive)' : '4px solid transparent',
                  outline: pendingAge === 'adult' ? '2px solid var(--color-olive)' : 'none',
                  outlineOffset: 0,
                }}
              >
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-navy)', fontWeight: 600 }}>
                  Adult
                </span>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)', maxWidth: 'none' }}>
                  Fully or mostly furred or feathered, appears grown or nearly grown
                </p>
              </button>

              <button
                onClick={() => setPendingAge('unsure')}
                className="card"
                style={{
                  textAlign: 'left',
                  padding: 'var(--space-6)',
                  cursor: 'pointer',
                  borderLeft: pendingAge === 'unsure' ? '4px solid var(--color-olive)' : '4px solid var(--color-gray)',
                  outline: pendingAge === 'unsure' ? '2px solid var(--color-olive)' : 'none',
                  outlineOffset: 0,
                }}
              >
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-navy)', fontWeight: 600 }}>
                  Unsure
                </span>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)', maxWidth: 'none' }}>
                  I&apos;m not sure how old the animal is
                </p>
              </button>

            </div>

            {/* Bottom navigation */}
            <div style={bottomNavStyle}>
              <button type="button" onClick={goBack} className="btn-secondary">← Back</button>
              <button
                type="button"
                className="btn-primary"
                disabled={!pendingAge}
                onClick={() => pendingAge && selectAge(pendingAge)}
              >
                Next →
              </button>
            </div>
          </>
        )}

        {/* ── STEP 3: CONDITION ─────────────────────────────────────────────── */}
        {step === 'condition' && (
          <>
            <span className="section-label">Step 3 of 4</span>
            <h2 style={{ marginTop: 'var(--space-2)', marginBottom: animalNote ? 'var(--space-6)' : 'var(--space-4)' }}>
              Describe the Situation:
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-8)' }}>
              Select all that apply.
            </p>

            {animalNote && (
              <div
                style={{
                  padding: 'var(--space-4) var(--space-5)',
                  borderRadius: 'var(--radius-md)',
                  background: animalNote.urgent ? 'rgba(193,84,57,0.08)' : 'rgba(51,101,138,0.08)',
                  borderLeft: `4px solid ${animalNote.urgent ? '#c15439' : 'var(--color-steel)'}`,
                  marginBottom: 'var(--space-6)',
                }}
              >
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-navy)', maxWidth: 'none', fontWeight: animalNote.urgent ? 600 : 400 }}>
                  {animalNote.urgent && <strong>Important: </strong>}
                  {animalNote.text}
                </p>
              </div>
            )}

            <form onSubmit={handleConditionSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>

                {activeConditions.map(cond => {
                  const isSelected = selectedConditions.has(cond.key)
                  return (
                    <div key={cond.key}>
                      {/* Condition toggle card */}
                      <button
                        type="button"
                        onClick={() => toggleCondition(cond.key)}
                        className="card"
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: 'var(--space-5) var(--space-6)',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: 'var(--space-4)',
                          alignItems: 'flex-start',
                          borderLeft: isSelected ? '4px solid var(--color-olive)' : '4px solid transparent',
                          outline: isSelected ? '2px solid var(--color-olive)' : 'none',
                          outlineOffset: 0,
                        }}
                      >
                        {/* Checkbox indicator */}
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 4,
                            flexShrink: 0,
                            marginTop: 2,
                            border: isSelected ? 'none' : '2px solid var(--color-border)',
                            background: isSelected ? 'var(--color-olive)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s',
                          }}
                        >
                          {isSelected && (
                            <span style={{ color: 'white', fontSize: 12, lineHeight: 1 }}>✓</span>
                          )}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-navy)', fontWeight: 600 }}>
                              {cond.label}
                            </span>
                            {cond.badge && <span className="badge">{cond.badge}</span>}
                          </div>
                          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)', maxWidth: 'none' }}>
                            {cond.description}
                          </p>
                          {cond.note && (
                            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-1)', maxWidth: 'none', fontStyle: 'italic' }}>
                              {cond.note}
                            </p>
                          )}
                        </div>
                      </button>

                      {/* Follow-up: No Sign of Mom → how long */}
                      {isSelected && cond.key === 'no_mom' && (
                        <div
                          style={{
                            marginTop: 'var(--space-1)',
                            padding: 'var(--space-5)',
                            background: 'rgba(103,133,83,0.05)',
                            border: '1px solid var(--color-border)',
                            borderTop: 'none',
                            borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                          }}
                        >
                          <label className="form-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                            How long has mom been gone?
                          </label>
                          <select
                            className="form-input"
                            value={noMomTime}
                            onChange={e => setNoMomTime(e.target.value)}
                            style={{ maxWidth: 340, marginBottom: 'var(--space-4)' }}
                          >
                            <option value="">Select a timeframe…</option>
                            <option value="Unknown (Just Found)">Unknown (Just Found)</option>
                            <option value="At least 30–60 minutes">At least 30–60 minutes</option>
                            <option value="2–12 hours">2–12 hours</option>
                            <option value="12–24 hours">12–24 hours</option>
                            <option value="24–48 hours">24–48 hours</option>
                            <option value="Over two days">Over two days</option>
                          </select>
                          
                          <label className="form-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                            What is the status of mom?
                          </label>
                          <select
                            className="form-input"
                            value={momStatus}
                            onChange={e => setMomStatus(e.target.value)}
                            style={{ maxWidth: 340 }}
                          >
                            <option value="">What&apos;s the status of mom?</option>
                            <option value="MomGone">I don&apos;t see mom anywhere.</option>
                            <option value="MomSeen">I&apos;ve seen mom, but she&apos;s not around now.</option>
                            <option value="MomDeceased">I can confirm that mom is deceased.</option>
                            <option value="MomRelocated">Mom has been relocated, but we found babies remaining</option>
                          
                          </select>
                        </div>
                      )}

                    </div>
                  )
                })}

              </div>

              {/* Symptom checklist — always visible */}
              <div className="form-group">
                <label className="form-label">
                  Please check off any of the following symptoms you can see{' '}
                  <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(optional)</span>
                </label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: 'var(--space-2)',
                    marginTop: 'var(--space-2)',
                  }}
                >
                  {INJURY_SYMPTOMS.map(symptom => {
                    const checked = injurySymptoms.includes(symptom)
                    return (
                      <label
                        key={symptom}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                          cursor: 'pointer',
                          padding: 'var(--space-2) var(--space-3)',
                          borderRadius: 'var(--radius-sm)',
                          background: checked ? 'rgba(103,133,83,0.1)' : 'transparent',
                          transition: 'background 0.1s',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSymptom(symptom)}
                          style={{ width: 15, height: 15, accentColor: 'var(--color-olive)', cursor: 'pointer', flexShrink: 0 }}
                        />
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-navy)' }}>
                          {symptom}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="condition-desc" className="form-label">
                  Any other details{' '}
                  <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(optional)</span>
                </label>
                <textarea
                  id="condition-desc"
                  className="form-input"
                  rows={4}
                  placeholder="Anything else you're observing — surroundings, behavior, how long you've been watching — will help a rehabber respond quickly."
                  value={conditionDesc}
                  onChange={e => setConditionDesc(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Bottom navigation */}
              <div style={bottomNavStyle}>
                <button type="button" onClick={goBack} className="btn-secondary">← Back</button>
                <button type="submit" className="btn-primary" disabled={selectedConditions.size === 0}>
                  Next →
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── STEP 4: LOCATION ─────────────────────────────────────────────── */}
        {step === 'location' && (
          <>
            <span className="section-label">Step 4 of 4</span>
            <h2 style={{ marginTop: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              Where was the animal found?
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)', maxWidth: '44ch' }}>
              This helps us match you with licensed rehabbers in the right area.
            </p>

            <form onSubmit={handleLocationSubmit} style={{ maxWidth: 340 }}>
              <div className="form-group">
                <label htmlFor="finder-name" className="form-label">
                  Your name{' '}
                  <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(optional)</span>
                </label>
                <input
                  id="finder-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Jane Smith"
                  value={finderName}
                  onChange={e => setFinderName(e.target.value)}
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="finder-phone" className="form-label">
                  Contact phone number{' '}
                  <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(optional)</span>
                </label>
                <input
                  id="finder-phone"
                  type="tel"
                  className="form-input"
                  placeholder="e.g. (555) 123-4567"
                  value={finderPhone}
                  onChange={e => setFinderPhone(e.target.value)}
                  autoComplete="tel"
                />
                <span className="form-hint">So a rehabber can reach you if needed.</span>
              </div>

              <div className="form-group">
                <label htmlFor="found-zip" className="form-label required">
                  ZIP code where the animal was found
                </label>
                <input
                  id="found-zip"
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  className="form-input"
                  placeholder="e.g. 48207"
                  value={foundZip}
                  onChange={e => setFoundZip(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="found-county" className="form-label required">
                  County where the animal was found
                </label>
                <select
                  id="found-county"
                  className="form-input"
                  value={foundCounty}
                  onChange={e => setFoundCounty(e.target.value)}
                  required
                >
                  <option value="" disabled>— Select a county —</option>
                  {MICHIGAN_COUNTIES.map(c => (
                    <option key={c} value={c}>{c} County</option>
                  ))}
                </select>
                <span className="form-hint">Used for rabies vector species tracking.</span>
              </div>

              <div className="form-group">
                <label htmlFor="current-zip" className="form-label">
                  Current / pickup location ZIP{' '}
                  <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(if different from above)</span>
                </label>
                <input
                  id="current-zip"
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  className="form-input"
                  placeholder="Leave blank if same as above"
                  value={currentZip}
                  onChange={e => setCurrentZip(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Are you able to transport the animal to a rehabber?</label>
                <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                  {([true, false] as const).map(val => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => {
                        setFinderCanTransport(val)
                        if (!val) setFinderTransportMiles(null)
                      }}
                      style={{
                        flex: 1,
                        padding: 'var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                        border: `2px solid ${finderCanTransport === val ? 'var(--color-olive)' : 'var(--color-border)'}`,
                        background: finderCanTransport === val ? 'rgba(103,133,83,0.08)' : 'white',
                        fontWeight: finderCanTransport === val ? 600 : 400,
                        color: finderCanTransport === val ? 'var(--color-olive)' : 'var(--color-text)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {val ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>

                {finderCanTransport === true && (
                  <div>
                    <label className="form-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                      Up to how many miles?
                    </label>
                    <select
                      className="form-input"
                      value={finderTransportMiles ?? ''}
                      onChange={e => setFinderTransportMiles(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">Select a range…</option>
                      <option value="5">Up to 5 miles</option>
                      <option value="10">Up to 10 miles</option>
                      <option value="25">Up to 25 miles</option>
                      <option value="50">Up to 50 miles</option>
                      <option value="100">50+ miles</option>
                    </select>
                  </div>
                )}

                {finderCanTransport === false && (
                  <>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', padding: 'var(--space-4)', background: 'rgba(51,101,138,0.06)', borderRadius: 'var(--radius-md)', maxWidth: 'none', marginBottom: 'var(--space-4)' }}>
                      No problem! A rehabber or member of our transport team will reach out to arrange pickup.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      <div>
                        <label className="form-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                          Street Address <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>(for planning purposes only)</span>
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Enter the street address..."
                          value={pickupStreet}
                          onChange={e => setPickupStreet(e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        <div style={{ flex: 2 }}>
                          <label className="form-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                            City
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="City"
                            value={pickupCity}
                            onChange={e => setPickupCity(e.target.value)}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label className="form-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="12345"
                            value={pickupZip}
                            onChange={e => setPickupZip(e.target.value.replace(/\D/g, ''))}
                            maxLength={5}
                          />
                        </div>
                      </div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
                        Someone will reach out to confirm and arrange a pickup time.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {submitError && (
                <p style={{ color: '#c15439', fontSize: 'var(--text-sm)', marginTop: 'var(--space-4)' }}>
                  {submitError}
                </p>
              )}

              {/* Bottom navigation */}
              <div style={bottomNavStyle}>
                <button type="button" onClick={goBack} className="btn-secondary" disabled={submitting}>← Back</button>
                <button type="submit" className="btn-primary" disabled={foundZip.length !== 5 || !foundCounty || submitting}>
                  {submitting ? 'Submitting…' : 'Submit Case'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── RESULTS ──────────────────────────────────────────────────────── */}
        {step === 'results' && (
          <>
            <span className="section-label" style={{ color: 'var(--color-olive)' }}>Case Created</span>
            <h2 style={{ marginTop: 'var(--space-3)', marginBottom: caseId ? 'var(--space-2)' : 'var(--space-6)' }}>
              Your case has been submitted.
            </h2>

            {caseId && (
              <>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', fontFamily: 'monospace' }}>
                  Case ID: {caseId}
                </p>
                <div style={{
                  background: 'rgba(103,133,83,0.06)',
                  border: '1px solid rgba(103,133,83,0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4)',
                  marginBottom: 'var(--space-6)',
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-navy)', marginBottom: 'var(--space-3)' }}>
                    <strong>Save this Case ID to track your case:</strong>
                  </p>
                  <p style={{
                    fontSize: 'var(--text-lg)',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: 'var(--color-olive)',
                    background: 'white',
                    padding: 'var(--space-2)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    marginBottom: 'var(--space-3)'
                  }}>
                    {caseId}
                  </p>
                  <Link
                    href="/case-lookup"
                    style={{
                      display: 'inline-block',
                      padding: 'var(--space-2) var(--space-4)',
                      background: 'var(--color-olive)',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 600
                    }}
                  >
                    Track This Case →
                  </Link>
                </div>
              </>
            )}

            <div
              style={{
                padding: 'var(--space-6)',
                background: 'rgba(103,133,83,0.08)',
                borderLeft: '4px solid var(--color-olive)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-6)',
              }}
            >
              <p style={{ color: 'var(--color-navy)', fontSize: 'var(--text-sm)', maxWidth: 'none', marginBottom: 'var(--space-3)' }}>
                A notification of your case has been sent to our network of licensed rehabbers and admins.
                If rehabber assistance is required, our team will reach out to arrange transport.
              </p>
              <p style={{ color: 'var(--color-navy)', fontSize: 'var(--text-sm)', maxWidth: 'none' }}>
                We aim to respond quickly — urgent cases are always prioritized based on the information provided.
              </p>
            </div>

            {/* Observe advice + escalation */}
            {isObserveAdvised && !escalated && (
              <div style={{ ...infoBoxStyle, marginBottom: 'var(--space-6)' }}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-navy)', marginBottom: 'var(--space-2)', maxWidth: 'none' }}>
                  While you wait — observe from a distance
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', maxWidth: 'none', marginBottom: 'var(--space-4)' }}>
                  Since the animal appeared to have no visible injuries, we recommend watching from at least
                  20 feet away for 30–60 minutes. Many animals that appear distressed will recover and move on their own.
                </p>

                {!escalating ? (
                  <button
                    className="btn-secondary"
                    onClick={() => setEscalating(true)}
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    It still needs help — escalate to a rehabber
                  </button>
                ) : (
                  <form onSubmit={handleEscalate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div className="form-group">
                      <label className="form-label required">Reason for escalation</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Still hasn't moved after an hour"
                        value={escalateReason}
                        onChange={e => setEscalateReason(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        How long have you been observing?{' '}
                        <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(optional)</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 45 minutes"
                        value={escalateTime}
                        onChange={e => setEscalateTime(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        Observation notes{' '}
                        <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(optional)</span>
                      </label>
                      <textarea
                        className="form-input"
                        rows={3}
                        placeholder="What did you observe during that time?"
                        value={escalateNotes}
                        onChange={e => setEscalateNotes(e.target.value)}
                        style={{ resize: 'vertical' }}
                      />
                    </div>
                    <div className="btn-group">
                      <button type="submit" className="btn-primary" disabled={!escalateReason}>
                        Submit Escalation
                      </button>
                      <button type="button" className="btn-secondary" onClick={() => setEscalating(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {escalated && (
              <div
                style={{
                  padding: 'var(--space-5)',
                  background: 'rgba(193,84,57,0.07)',
                  borderLeft: '4px solid #c15439',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--space-6)',
                }}
              >
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: '#c15439', maxWidth: 'none' }}>
                  Escalation submitted — your case has been marked urgent.
                </p>
              </div>
            )}

            {/* DNR link */}
            <div style={{ ...infoBoxStyle, marginBottom: 'var(--space-6)' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', maxWidth: 'none' }}>
                <strong style={{ color: 'var(--color-navy)' }}>Want to call directly?</strong>{' '}
                The Michigan DNR maintains a statewide directory of licensed wildlife rehabilitators.{' '}
                <a
                  href={DNR_REHABBER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-steel)', fontWeight: 600 }}
                >
                  View the DNR rehabber directory →
                </a>
              </p>
            </div>

            {/* Create account prompt */}
            <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)', fontSize: 'var(--text-lg)' }}>
                Track your case
              </h3>
              <p className="card__body">
                Create a free account to track the status of your case, receive updates, and report future sightings.
              </p>
              <div className="btn-group" style={{ marginTop: 'var(--space-5)' }}>
                <Link
                  href={`/login?tab=register${finderName ? `&name=${encodeURIComponent(finderName.trim())}` : ''}${finderPhone ? `&phone=${encodeURIComponent(finderPhone.trim())}` : ''}`}
                  className="btn-primary"
                >
                  Create a Free Account
                </Link>
                <Link href="/login" className="btn-secondary">
                  Sign In
                </Link>
              </div>
            </div>

            <button onClick={restart} style={{ color: 'var(--color-steel)', fontSize: 'var(--text-sm)' }}>
              Start over
            </button>
          </>
        )}
      </div>
    </div>
  )
}
