"use client"

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '@/services/api'
import ConfirmModal from '@/components/ConfirmModal'
import AppLayout from '@/components/AppLayout'

export default function AdminDashboard() {
    const [officers, setOfficers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAdd, setShowAdd] = useState(false)
    const [form, setForm] = useState({ username: '', password: '', fullName: '' })
    const [confirmAction, setConfirmAction] = useState(null)
    const [saving, setSaving] = useState(false)
    const [resetPassValue, setResetPassValue] = useState('')

    const fetchOfficers = async () => {
        try {
            const { data } = await api.get('/users')
            setOfficers(data)
        } catch {
            toast.error('Failed to load officers')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchOfficers() }, [])

    const handleAddSubmit = async (e) => {
        e.preventDefault()
        if (!form.username || !form.password || !form.fullName) return toast.error('All fields required')
        setSaving(true)
        try {
            await api.post('/users', form)
            toast.success('Officer created successfully')
            setShowAdd(false)
            setForm({ username: '', password: '', fullName: '' })
            fetchOfficers()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create officer')
        } finally {
            setSaving(false)
        }
    }

    const handleConfirmAction = async () => {
        if (!confirmAction) return
        setSaving(true)
        try {
            if (confirmAction.type === 'toggle') {
                await api.put(`/users/${confirmAction.user.id}/toggle-active`)
                toast.success(`User ${confirmAction.user.active ? 'disabled' : 'enabled'} successfully`)
            } else if (confirmAction.type === 'reset') {
                if (!resetPassValue || resetPassValue.length < 6) throw new Error('Password must be at least 6 characters')
                await api.put(`/users/${confirmAction.user.id}/reset-password`, { newPassword: resetPassValue })
                toast.success('Password reset successfully')
            }
            setConfirmAction(null)
            setResetPassValue('')
            fetchOfficers()
        } catch (err) {
            toast.error(err.response?.data?.error || err.message || 'Action failed')
        } finally {
            setSaving(false)
        }
    }

    const activeCount = officers.filter(o => o.active).length
    const disabledCount = officers.filter(o => !o.active).length

    const getInitials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'

    return (
        <AppLayout>
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="page-header">
                <div>
                    <div className="page-title">User Management</div>
                    <div className="page-subtitle">Create and manage Gate Officer accounts</div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                    + Add New Officer
                </button>
            </div>

            {/* ── Stats Bar ───────────────────────────────────────────────── */}
            <div className="stats-bar">
                <div className="stat-chip total active" style={{ cursor: 'default' }}>
                    {officers.length} Total Officers
                </div>
                <div className="stat-chip approved" style={{ cursor: 'default' }}>
                    {activeCount} Active
                </div>
                <div className="stat-chip pending" style={{ cursor: 'default' }}>
                    {disabledCount} Disabled
                </div>
            </div>

            {/* ── Officers Table ──────────────────────────────────────────── */}
            <div className="table-wrapper">
                <div className="device-table-container">
                    {loading ? (
                        <div className="loading-overlay">
                            <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                        </div>
                    ) : officers.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-title">No officers yet</div>
                            <div className="empty-desc">Click "Add New Officer" to create the first gate officer account.</div>
                        </div>
                    ) : (
                        <table className="device-table">
                            <thead>
                                <tr>
                                    <th>Officer</th>
                                    <th>Username</th>
                                    <th>Status</th>
                                    <th style={{ width: 160 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {officers.map(o => (
                                    <tr key={o.id} style={{ opacity: o.active ? 1 : 0.55 }}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: 36, height: 36,
                                                    borderRadius: '50%',
                                                    background: o.active
                                                        ? 'var(--bg-elevated)'
                                                        : 'var(--bg-primary)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)',
                                                    flexShrink: 0, border: '1px solid var(--border-active)'
                                                }}>
                                                    {getInitials(o.fullName)}
                                                </div>
                                                <div>
                                                    <div className="owner-name">{o.fullName}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Gate Officer</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="serial-number">{o.username}</span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${o.active ? 'APPROVED' : 'PENDING'}`}>
                                                {o.active ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    title="Reset Password"
                                                    onClick={() => setConfirmAction({ type: 'reset', user: o })}
                                                >
                                                    Reset
                                                </button>
                                                <button
                                                    className={`btn ${o.active ? 'btn-danger' : 'btn-success'} btn-sm`}
                                                    title={o.active ? 'Disable Account' : 'Enable Account'}
                                                    onClick={() => setConfirmAction({ type: 'toggle', user: o })}
                                                >
                                                    {o.active ? 'Disable' : 'Enable'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ── Add Officer Modal ────────────────────────────────────────── */}
            {showAdd && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
                    <div className="modal">
                        <div className="modal-header">
                            <span className="modal-title">Create Gate Officer</span>
                            <button className="btn-close" onClick={() => setShowAdd(false)}>×</button>
                        </div>
                        <form onSubmit={handleAddSubmit}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
                                <div className="form-group">
                                    <label className="form-label">Full Name <span className="required">*</span></label>
                                    <input
                                        className="form-control"
                                        placeholder="e.g. Abebe Bekele"
                                        autoFocus
                                        required
                                        value={form.fullName}
                                        onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Username <span className="required">*</span></label>
                                    <input
                                        className="form-control"
                                        placeholder="e.g. officer2"
                                        required
                                        value={form.username}
                                        onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Temporary Password <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Min. 6 characters"
                                        required
                                        value={form.password}
                                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    />
                                    <span className="form-error" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                                        The officer can change this after logging in.
                                    </span>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Creating...</> : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Confirm Action Modal ─────────────────────────────────────── */}
            {confirmAction && (
                <ConfirmModal
                    title={confirmAction.type === 'toggle'
                        ? (confirmAction.user.active ? 'Disable Officer' : 'Enable Officer')
                        : 'Reset Password'}
                    message={confirmAction.type === 'toggle'
                        ? <>Are you sure you want to <strong>{confirmAction.user.active ? 'disable' : 'enable'}</strong> the account for <strong>{confirmAction.user.fullName}</strong>?</>
                        : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                                <label className="form-label" style={{ textAlign: 'left' }}>
                                    New Password for <strong style={{ color: 'var(--text-primary)' }}>{confirmAction.user.fullName}</strong>
                                </label>
                                <input
                                    className="form-control"
                                    type="text"
                                    placeholder="Enter new password (min 6 chars)"
                                    value={resetPassValue}
                                    onChange={(e) => setResetPassValue(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        )
                    }
                    danger={confirmAction.type === 'toggle' && confirmAction.user.active}
                    loading={saving}
                    onConfirm={handleConfirmAction}
                    onClose={() => { setConfirmAction(null); setResetPassValue('') }}
                />
            )}
        </AppLayout>
    )
}
