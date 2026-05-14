// WildWise — Supabase client
// If SUPABASE_URL / SUPABASE_ANON_KEY are exposed via window globals, Supabase will be enabled.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../env.js'

const supabaseUrl = SUPABASE_URL || null
const supabaseKey = SUPABASE_ANON_KEY || null

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null
