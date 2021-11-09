import { createClient } from "@supabase/supabase-js"
import camelCase from "camelcase-keys"

const { SUPABASE_KEY, SUPABASE_URL } = process.env

export function createSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY)
}
