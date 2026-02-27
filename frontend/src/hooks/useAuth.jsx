"use client"

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    // Start as null — we'll load from localStorage after hydration
    const [user, setUser] = useState(null)
    const [loaded, setLoaded] = useState(false)

    // Runs only in browser, after first render — avoids hydration mismatch
    useEffect(() => {
        try {
            const stored = localStorage.getItem('zb_user')
            if (stored) setUser(JSON.parse(stored))
        } catch {
            // ignore
        }
        setLoaded(true)
    }, [])

    const signIn = useCallback((userData, token) => {
        localStorage.setItem('zb_token', token)
        localStorage.setItem('zb_user', JSON.stringify(userData))
        setUser(userData)
    }, [])

    const signOut = useCallback(() => {
        localStorage.removeItem('zb_token')
        localStorage.removeItem('zb_user')
        setUser(null)
    }, [])

    return (
        <AuthContext.Provider value={{ user, signIn, signOut, isAuthenticated: !!user, loaded }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
