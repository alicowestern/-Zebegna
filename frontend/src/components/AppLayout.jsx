"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function AppLayout({ children }) {
    const { user, signOut } = useAuth()
    const pathname = usePathname()
    const router = useRouter()

    const handleSignOut = () => {
        signOut()
        router.push('/login')
    }

    const initials = user?.fullName
        ? user.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : '?'

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <span className="brand-ethiopic">ዘበኛ</span>
                    <span className="brand-latin">Zebegna</span>
                </div>

                <nav className="sidebar-nav">
                    <Link
                        href="/devices"
                        className={`nav-item${pathname === '/devices' ? ' active' : ''}`}
                    >
                        Gate Console
                    </Link>
                    {user?.role === 'ADMIN' && (
                        <Link
                            href="/admin"
                            className={`nav-item${pathname === '/admin' ? ' active' : ''}`}
                        >
                            User Management
                        </Link>
                    )}
                    {user?.role === 'ADMIN' && (
                        <Link
                            href="/logs"
                            className={`nav-item${pathname === '/logs' ? ' active' : ''}`}
                        >
                            Activity Log
                        </Link>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">{initials}</div>
                        <div>
                            <div className="user-name">{user?.fullName || user?.username}</div>
                            <div className="user-role">{user?.role?.replace('_', ' ')}</div>
                        </div>
                    </div>
                    <button className="btn-logout" onClick={handleSignOut}>
                        Sign Out
                    </button>
                </div>
            </aside>

            <main className="main-area">
                {children}
            </main>
        </div>
    )
}
