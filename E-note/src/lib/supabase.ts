import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const supabase = (() => {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase env vars are missing or empty.')
    return null
  }

  try {
    return createClient(supabaseUrl, supabaseKey)
  } catch (error) {
    console.error('Failed to create Supabase client.', error)
    return null
  }
})()