import { createClient } from '@supabase/supabase-js'

// Placeholder keys - User must replace these or meaningful mock data will be used.
// For the free app, these should eventually come from environment variables.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyz.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)
