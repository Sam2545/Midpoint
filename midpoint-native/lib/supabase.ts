import { createClient } from '@supabase/supabase-js'

// In Expo/React Native, environment variables are accessed via process.env with EXPO_PUBLIC_ prefix
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://dvivoebvqlzrgqgvydwd.supabase.co'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2aXZvZWJ2cWx6cmdxZ3Z5ZHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMzgyOTUsImV4cCI6MjA3NjcxNDI5NX0.1wd9JOempH3NraT89CiYkdMubaUSXUHADWd_lzDMaLE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  address?: string
  created_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  first_name: string
  last_name: string
  email: string
  phone?: string
  password: string
  address?: string
}

