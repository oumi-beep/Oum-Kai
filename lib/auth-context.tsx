"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import * as localStorage from "@/lib/local-storage"
import type { User } from "@/lib/local-storage"

type AuthContextType = {
  user: User | null
  isLoading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => void
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updatePassword: (password: string) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkSession = () => {
      try {
        const currentUser = localStorage.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Failed to check auth session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const newUser = localStorage.createUser(email, password, fullName)
      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error : new Error(String(error)) }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const user = localStorage.authenticateUser(email, password)
      setUser(user)
      localStorage.saveCurrentUser(user)
      router.push("/dashboard")
      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error : new Error(String(error)) }
    }
  }

  const signOut = () => {
    setUser(null)
    localStorage.saveCurrentUser(null)
    router.push("/login")
  }

  const resetPassword = async (email: string) => {
    try {
      const token = localStorage.createResetToken(email)
      // In a real app, you would send an email with the reset link
      // For this demo, we'll just log the token
      console.log(`Reset token for ${email}: ${token}`)
      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error : new Error(String(error)) }
    }
  }

  const updatePassword = async (password: string) => {
    try {
      if (!user) {
        throw new Error("No user is logged in")
      }

      localStorage.updateUserPassword(user.id, password)

      // Update the current user in state and storage
      const updatedUser = { ...user, password }
      setUser(updatedUser)
      localStorage.saveCurrentUser(updatedUser)

      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error : new Error(String(error)) }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
