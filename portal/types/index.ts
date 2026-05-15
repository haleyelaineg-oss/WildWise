export type UserRole =
  | 'finder'
  | 'licensed_rehabber'
  | 'sub_permittee'
  | 'volunteer'
  | 'transport_volunteer'
  | 'licensed_vet'
  | 'admin'

/** Roles that require admin approval before dashboard access is granted */
export const ADMIN_APPROVED_ROLES: UserRole[] = ['licensed_rehabber', 'licensed_vet']

/** Roles that require approval from a licensed_rehabber */
export const REHABBER_APPROVED_ROLES: UserRole[] = ['sub_permittee']

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  approved: boolean
  approved_by: string | null
  display_name: string | null
  license_number: string | null
  created_at: string
}

export type CaseStatus =
  | 'open'
  | 'accepted'
  | 'pending_transport'
  | 'transport_secured'
  | 'en_route'
  | 'in_care'
  | 'assigned_to_sub_permittee'
  | 'pending_release'
  | 'reunite_pending'
  | 'reunite_attempt_failed'
  | 'unreleasable'
  | 'deceased'
  | 'resolved'
  | 'closed'

export interface WildlifeCase {
  id: string
  created_at: string
  animal_species: string | null
  animal_detail: string | null
  animal_age: string | null
  conditions: string[]
  injury_symptoms: string[]
  no_mom_time: string | null
  condition_desc: string | null
  found_zip: string
  found_county: string | null
  current_zip: string | null
  is_urgent: boolean
  status: CaseStatus
  assigned_to: string | null
  assigned_at: string | null
  assigned_by: string | null
  user_id: string | null
  finder_name: string | null
  finder_phone: string | null
  finder_can_transport: boolean | null
  finder_transport_miles: number | null
  sub_assigned_to: string | null
  close_reason: string | null
  closed_at: string | null
  finder_notes: string[]
}

export interface WildlifeCaseWithAssignee extends WildlifeCase {
  assigned_profile: { display_name: string | null } | null
}
