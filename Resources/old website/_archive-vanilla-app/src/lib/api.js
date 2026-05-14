/**
 * api.js — WildWise Supabase data helpers
 *
 * Central place for all database queries.
 * Each function returns { data, error } matching Supabase conventions.
 */

import { supabase } from './supabase.js'
import { genId } from './utils.js'

const LOCAL_SHIFTS_KEY = 'wildwise_shifts'
const LOCAL_SHIFT_SIGNUPS_KEY = 'wildwise_shift_signups'

function loadLocalShifts() {
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_SHIFTS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveLocalShifts(shifts) {
  window.localStorage.setItem(LOCAL_SHIFTS_KEY, JSON.stringify(shifts || []))
}

function loadLocalShiftSignups() {
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_SHIFT_SIGNUPS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveLocalShiftSignups(signups) {
  window.localStorage.setItem(LOCAL_SHIFT_SIGNUPS_KEY, JSON.stringify(signups || []))
}

function annotateShift(shift, signups) {
  const shiftSignups = signups.filter(signup => signup.shiftId === shift.id)
  return {
    ...shift,
    signups: shiftSignups,
    filled: shiftSignups.length,
    spotsRemaining: Math.max(0, (Number(shift.capacity) || 0) - shiftSignups.length),
  }
}

// ---------------------------------------------------------------------------
// Cases
// ---------------------------------------------------------------------------

export async function getCases(filters = {}) {
  // let query = supabase.from('cases').select('*, profiles(full_name)')
  // if (filters.status)      query = query.eq('status', filters.status)
  // if (filters.assignedTo)  query = query.eq('assigned_to', filters.assignedTo)
  // if (filters.rehabber_id) query = query.eq('rehabber_id', filters.rehabber_id)
  // const { data, error } = await query.order('intake_date', { ascending: false })
  // return { data, error }
  return { data: [], error: null } // TODO
}

export async function getCaseById(id) {
  // const { data, error } = await supabase
  //   .from('cases')
  //   .select('*, profiles(full_name), medical_logs(*), feeding_logs(*)')
  //   .eq('id', id)
  //   .single()
  // return { data, error }
  return { data: null, error: null } // TODO
}

export async function createCase(payload) {
  // const { data, error } = await supabase.from('cases').insert(payload).select().single()
  // return { data, error }
  return { data: null, error: null } // TODO
}

export async function updateCase(id, payload) {
  // const { data, error } = await supabase.from('cases').update(payload).eq('id', id).select().single()
  // return { data, error }
  return { data: null, error: null } // TODO
}

// ---------------------------------------------------------------------------
// Medical logs
// ---------------------------------------------------------------------------

export async function getMedicalLogs(caseId) {
  // const { data, error } = await supabase
  //   .from('medical_logs')
  //   .select('*, profiles(full_name)')
  //   .eq('case_id', caseId)
  //   .order('logged_at', { ascending: false })
  // return { data, error }
  return { data: [], error: null } // TODO
}

export async function addMedicalLog(payload) {
  // const { data, error } = await supabase.from('medical_logs').insert(payload).select().single()
  // return { data, error }
  return { data: null, error: null } // TODO
}

// ---------------------------------------------------------------------------
// Feeding logs
// ---------------------------------------------------------------------------

export async function getFeedingLogs(caseId) {
  // const { data, error } = await supabase
  //   .from('feeding_logs')
  //   .select('*, profiles(full_name)')
  //   .eq('case_id', caseId)
  //   .order('fed_at', { ascending: false })
  // return { data, error }
  return { data: [], error: null } // TODO
}

export async function addFeedingLog(payload) {
  // const { data, error } = await supabase.from('feeding_logs').insert(payload).select().single()
  // return { data, error }
  return { data: null, error: null } // TODO
}

// ---------------------------------------------------------------------------
// Users / Profiles
// ---------------------------------------------------------------------------

export async function getProfiles(filters = {}) {
  if (supabase) {
    let query = supabase.from('profiles').select('*')
    if (filters.role) query = query.eq('role', filters.role)
    if (typeof filters.approved !== 'undefined') query = query.eq('approved', filters.approved)
    const { data, error } = await query.order('created_at', { ascending: false })
    return { data, error }
  }

  const users = loadLocalUsers()
  let data = users
  if (filters.role) data = data.filter(user => user.role === filters.role)
  if (typeof filters.approved !== 'undefined') data = data.filter(user => user.approved === filters.approved)
  return { data, error: null }
}

export async function updateProfile(id, payload) {
  if (supabase) {
    const { data, error } = await supabase.from('profiles').update(payload).eq('id', id).select().single()
    return { data, error }
  }

  const users = loadLocalUsers()
  const index = users.findIndex(user => user.id === id)
  if (index === -1) {
    return { data: null, error: new Error('Profile not found.') }
  }
  users[index] = { ...users[index], ...payload }
  saveLocalUsers(users)
  return { data: users[index], error: null }
}

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export async function getInventory(rehabber_id) {
  // const { data, error } = await supabase
  //   .from('inventory')
  //   .select('*')
  //   .eq('rehabber_id', rehabber_id)
  //   .order('item_name')
  // return { data, error }
  return { data: [], error: null } // TODO
}

// ---------------------------------------------------------------------------
// Transport requests
// ---------------------------------------------------------------------------

export async function getTransportRequests(filters = {}) {
  // let query = supabase.from('transport_requests').select('*, cases(species, status), profiles(full_name)')
  // if (filters.status)    query = query.eq('status', filters.status)
  // if (filters.driver_id) query = query.eq('driver_id', filters.driver_id)
  // return await query.order('requested_at', { ascending: false })
  return { data: [], error: null } // TODO
}

// ---------------------------------------------------------------------------
// Volunteer scheduling
// ---------------------------------------------------------------------------

export async function getShifts(filters = {}) {
  if (supabase) {
    const { data, error } = await supabase
      .from('volunteer_shifts')
      .select('*')
      .order('date', { ascending: true })
    return { data, error }
  }

  const shifts = loadLocalShifts()
  const signups = loadLocalShiftSignups()
  let data = shifts.map(shift => annotateShift(shift, signups))

  if (filters.rehabberId) {
    data = data.filter(shift => shift.rehabberId === filters.rehabberId)
  }
  if (filters.open) {
    data = data.filter(shift => shift.spotsRemaining > 0)
  }

  return { data, error: null }
}

export async function createShift(payload) {
  if (supabase) {
    const { data, error } = await supabase.from('volunteer_shifts').insert(payload).select().single()
    return { data, error }
  }

  const shifts = loadLocalShifts()
  const shift = {
    id: genId('shift'),
    title: payload.title,
    task: payload.task,
    date: payload.date,
    start_time: payload.start_time,
    end_time: payload.end_time,
    capacity: Number(payload.capacity) || 1,
    rehabberId: payload.rehabberId,
    createdAt: new Date().toISOString(),
  }
  shifts.unshift(shift)
  saveLocalShifts(shifts)
  return { data: annotateShift(shift, loadLocalShiftSignups()), error: null }
}

export async function getShiftSignups(shiftId) {
  if (supabase) {
    const { data, error } = await supabase
      .from('shift_signups')
      .select('*')
      .eq('shift_id', shiftId)
      .order('created_at', { ascending: true })
    return { data, error }
  }

  const signups = loadLocalShiftSignups()
  return { data: signups.filter(signup => signup.shiftId === shiftId), error: null }
}

export async function signUpForShift({ shiftId, volunteerId, volunteerName }) {
  if (supabase) {
    const { data, error } = await supabase.from('shift_signups').insert({
      shift_id: shiftId,
      volunteer_id: volunteerId,
      volunteer_name: volunteerName,
    }).select().single()
    return { data, error }
  }

  const signups = loadLocalShiftSignups()
  const shifts = loadLocalShifts()
  const shift = shifts.find(item => item.id === shiftId)
  if (!shift) {
    return { data: null, error: new Error('Shift not found.') }
  }

  const existing = signups.find(item => item.shiftId === shiftId && item.volunteerId === volunteerId)
  if (existing) {
    return { data: null, error: new Error('You are already signed up for this shift.') }
  }

  const signedCount = signups.filter(item => item.shiftId === shiftId).length
  if (signedCount >= (Number(shift.capacity) || 0)) {
    return { data: null, error: new Error('This shift is already full.') }
  }

  const signup = {
    id: genId('signup'),
    shiftId,
    volunteerId,
    volunteerName: volunteerName || 'Volunteer',
    createdAt: new Date().toISOString(),
  }
  signups.push(signup)
  saveLocalShiftSignups(signups)
  return { data: signup, error: null }
}

export async function getVolunteerSignups(volunteerId) {
  if (supabase) {
    const { data, error } = await supabase
      .from('shift_signups')
      .select('*')
      .eq('volunteer_id', volunteerId)
      .order('created_at', { ascending: true })
    return { data, error }
  }

  const signups = loadLocalShiftSignups()
  return { data: signups.filter(item => item.volunteerId === volunteerId), error: null }
}

export async function cancelShiftSignup(signupId) {
  if (supabase) {
    const { data, error } = await supabase
      .from('shift_signups')
      .delete()
      .eq('id', signupId)
      .single()
    return { data, error }
  }

  const signups = loadLocalShiftSignups()
  const next = signups.filter(item => item.id !== signupId)
  saveLocalShiftSignups(next)
  return { data: { id: signupId }, error: null }
}
