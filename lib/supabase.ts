import { createClient } from "@supabase/supabase-js"

// Check if Supabase environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a mock client if Supabase is not configured
const createMockClient = () => {
  console.warn(
    "Supabase environment variables are not set. Using mock client. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  )

  // Return a mock client with the same interface but no actual functionality
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: async () => ({ error: null }),
      signInWithPassword: async () => ({ error: null }),
      signOut: async () => {},
      resetPasswordForEmail: async () => ({ error: null }),
      updateUser: async () => ({ error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          order: () => ({ data: [], error: null }),
        }),
        neq: () => ({
          eq: () => ({
            order: () => ({ data: [], error: null }),
          }),
        }),
        order: () => ({ data: [], error: null }),
      }),
      insert: () => ({ select: async () => ({ data: [], error: null }) }),
      update: () => ({ eq: () => ({ data: null, error: null }) }),
      delete: () => ({ eq: () => ({ data: null, error: null }) }),
    }),
    storage: {
      from: () => ({
        upload: async () => ({ error: null }),
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
      }),
    },
  }
}

// Create the Supabase client or use mock if not configured
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : createMockClient()

// Database types
export type Profile = {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export type Task = {
  id: string
  user_id: string
  title: string
  description: string | null
  day: string
  time: string
  priority: "low" | "medium" | "high"
  completed: boolean
  created_at: string
}

export type Quote = {
  id: string
  user_id: string
  text: string
  author: string
  is_favorite: boolean
  is_public: boolean
  created_at: string
}
