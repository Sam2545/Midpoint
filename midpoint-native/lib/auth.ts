import { supabase, UserProfile, LoginCredentials, RegisterData } from './supabase'

const errorMessage = (message: string) => ({ message })

export class AuthService {
  // Sign up a new user directly in the users table
  static async signUp(userData: RegisterData) {
    try {
      const { exists } = await this.checkUserExists(userData.email)
      if (exists) {
        return {
          data: null,
          error: errorMessage('User with this email already exists. Please sign in instead.')
        }
      }

      const { data, error } = await supabase
        .from('users')
        .insert({
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          password_hash: userData.password // TODO: hash before storing in production
        })
        .select('*')
        .single()

      if (error) {
        throw error
      }

      const mockUser = {
        id: data.id,
        email: data.email,
        user_metadata: {
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          address: data.address
        }
      }

      return {
        data: {
          user: mockUser,
          profile: data as UserProfile
        },
        error: null
      }
    } catch (error) {
      console.error('signUp error', error)
      return { data: null, error: errorMessage('Unable to sign up right now. Please try again.') }
    }
  }

  // Simple email + password validation against users table
  static async signIn(credentials: LoginCredentials) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', credentials.email)
        .eq('password_hash', credentials.password)

      if (error) {
        return { data: null, error: errorMessage('Database error. Please try again.') }
      }

      if (!data || data.length === 0) {
        return { data: null, error: errorMessage('Invalid email or password.') }
      }

      const user = data[0]
      const mockUser = {
        id: user.id,
        email: user.email,
        user_metadata: {
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          address: user.address
        }
      }

      return {
        data: {
          user: mockUser,
          profile: user as UserProfile
        },
        error: null
      }
    } catch (error) {
      console.error('signIn error', error)
      return { data: null, error: errorMessage('An error occurred. Please try again.') }
    }
  }

  // Check if user exists by email (users table)
  static async checkUserExists(email: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .eq('email', email)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return { exists: !!data, user: data, error: null }
    } catch (error) {
      return { exists: false, user: null, error }
    }
  }

  // Get current user profile
  static async getCurrentUser() {
    try {
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return { user: null, profile: null, error: authError }
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      return { user, profile, error: null }
    } catch (error) {
      return { user: null, profile: null, error }
    }
  }

  // Sign out
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }
}
