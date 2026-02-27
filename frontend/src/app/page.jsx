"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function Home() {
    const { user, loaded } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loaded) return   // wait until localStorage has been read
        if (!user) {
            router.replace('/login')
        } else if (user.role === 'ADMIN') {
            router.replace('/admin')
        } else {
            router.replace('/devices')
        }
    }, [user, loaded, router])

    // Show a minimal Full-screen loader while we determine auth state
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)'
        }}>
            <span className="spinner" style={{ width: 24, height: 24 }} />
        </div>
    )
}
