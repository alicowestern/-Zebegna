"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { login } from '@/services/api'

export default function LoginPage() {
    const { signIn } = useAuth()
    const router = useRouter()
    const [form, setForm] = useState({ username: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }))
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.username || !form.password) {
            setError('Please enter your username and password.')
            return
        }
        setLoading(true)
        try {
            const res = await login(form)
            const { token, username, fullName, role } = res.data
            signIn({ username, fullName, role }, token)
            toast.success(`Welcome, ${fullName || username}!`)
            router.push('/devices')
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Invalid credentials. Please try again.'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">

            {/* ── LEFT: Background image panel ── */}
            <div className="login-panel-image">
                <div className="login-panel-caption">
                    <span className="cap-ethiopic">ዘበኛ</span>
                    <div className="cap-title">Gate Officer Management</div>
                    <div className="cap-sub">
                        Digital Ethiopia begins with simple, smart systems.
                    </div>
                </div>
            </div>

            {/* ── RIGHT: Form panel ── */}
            <div className="login-panel-form">
                <div className="login-card">

                    {/* Brand */}
                    <div className="login-brand">
                        <span className="login-ethiopic">ዘበኛ</span>
                    </div>

                    {/* Thin divider separating brand from form */}
                    <div style={{ height: 1, background: 'var(--border-subtle)', margin: '2px 0 16px' }} />

                    {/* Heading */}
                    <div className="login-heading">Sign in to your account</div>
                    <div className="login-heading-sub">Enter your credentials to continue</div>


                    {/* Form */}
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input
                                name="username"
                                type="text"
                                className="form-control"
                                placeholder="e.g. admin"
                                value={form.username}
                                onChange={handleChange}
                                autoFocus
                                autoComplete="username"
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative', width: '100%' }}>
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-control"
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                    style={{ paddingRight: '42px', width: '100%' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '12px', top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none', border: 'none',
                                        color: 'var(--text-muted)', cursor: 'pointer',
                                        padding: '4px', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        transition: 'color 0.1s'
                                    }}
                                    title={showPassword ? 'Hide password' : 'Show password'}
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                background: 'rgba(216,75,75,0.08)',
                                border: '1px solid rgba(216,75,75,0.22)',
                                color: 'var(--accent-red)',
                                padding: '10px 14px',
                                borderRadius: 'var(--r2)',
                                fontSize: '13px',
                                lineHeight: '1.4',
                            }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-login"
                            disabled={loading}
                        >
                            {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In'}
                        </button>
                    </form>

                </div>
            </div>

        </div>
    )
}
