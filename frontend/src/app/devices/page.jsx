"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import {
    getDevices, getSerialSuggestions, registerDevice,
    updateDevice, deleteDevice, approveExit, manualVerification
} from '@/services/api'
import DeviceModal from '@/components/DeviceModal'
import ConfirmModal from '@/components/ConfirmModal'
import { useAuth } from '@/hooks/useAuth'
import AppLayout from '@/components/AppLayout'

const REASON_LABELS = { WORK: 'Work', REWARD: 'Reward', OTHER: 'Other' }
const SORT_FIELDS = { deviceName: 'Device', serialNumber: 'Serial', ownerName: 'Owner', registrationDate: 'Date', verificationStatus: 'Status' }

export default function GateOfficerPage() {
    const { user } = useAuth()
    const [devices, setDevices] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('ALL') // Show all devices so APPROVED ones remain visible
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [sort, setSort] = useState({ field: 'registrationDate', dir: 'desc' })

    // Modals
    const [showRegister, setShowRegister] = useState(false)
    const [editDevice, setEditDevice] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [actionLoading, setActionLoading] = useState({}) // { [id]: true }

    const searchRef = useRef(null)
    const suggestTimer = useRef(null)
    const refreshTimer = useRef(null)

    // ── Fetch Devices ─────────────────────────────────────────────────────────
    const fetchDevices = useCallback(async (q = search) => {
        try {
            const res = await getDevices(q)
            setDevices(res.data)
        } catch {
            // silent on auto-refresh
        } finally {
            setLoading(false)
        }
    }, [search])

    // Initial load + auto-refresh every 10s
    useEffect(() => {
        fetchDevices()
        refreshTimer.current = setInterval(() => fetchDevices(), 10000)
        return () => clearInterval(refreshTimer.current)
    }, [fetchDevices])

    // ── Search with debounce ──────────────────────────────────────────────────
    useEffect(() => {
        const t = setTimeout(() => fetchDevices(search), 300)
        return () => clearTimeout(t)
    }, [search])

    // ── Suggestions ───────────────────────────────────────────────────────────
    const fetchSuggestions = useCallback(async (val) => {
        if (val.length < 2) { setSuggestions([]); return }
        try {
            const res = await getSerialSuggestions(val)
            setSuggestions(res.data.slice(0, 6))
        } catch {
            setSuggestions([])
        }
    }, [])

    const handleSearchChange = (e) => {
        const val = e.target.value
        setSearch(val)
        if (val.length > 0) setFilter('ALL') // Show all when searching
        clearTimeout(suggestTimer.current)
        suggestTimer.current = setTimeout(() => fetchSuggestions(val), 250)
        setShowSuggestions(true)
    }

    const pickSuggestion = (s) => {
        setSearch(s)
        setShowSuggestions(false)
        fetchDevices(s)
    }

    // ── Sorting ───────────────────────────────────────────────────────────────
    const toggleSort = (field) => {
        setSort(s => ({ field, dir: s.field === field && s.dir === 'asc' ? 'desc' : 'asc' }))
    }

    const sorted = [...devices]
        .filter(d => filter === 'ALL' || d.verificationStatus === filter)
        .sort((a, b) => {
            let av = a[sort.field] ?? '', bv = b[sort.field] ?? ''
            if (typeof av === 'string') av = av.toLowerCase(), bv = bv.toLowerCase()
            if (av < bv) return sort.dir === 'asc' ? -1 : 1
            if (av > bv) return sort.dir === 'asc' ? 1 : -1
            return 0
        })

    // ── Actions ───────────────────────────────────────────────────────────────
    const setLoaderFor = (id, v) => setActionLoading(p => ({ ...p, [id]: v }))

    const handleApprove = async (device) => {
        setLoaderFor(device.id, 'approve')
        try {
            await approveExit(device.id)
            toast.success(`Exit approved: ${device.serialNumber}`, { duration: 5000 })
            fetchDevices()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to approve exit')
        } finally {
            setLoaderFor(device.id, null)
        }
    }

    const handleManual = async (device) => {
        setLoaderFor(device.id, 'manual')
        try {
            await manualVerification(device.id)
            toast.success(`Manual verification done: ${device.serialNumber}`, { duration: 5000 })
            fetchDevices()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Manual verification failed')
        } finally {
            setLoaderFor(device.id, null)
        }
    }

    const handleDelete = async () => {
        if (!confirmDelete) return
        setLoaderFor(confirmDelete.id, 'delete')
        try {
            await deleteDevice(confirmDelete.id)
            toast.success('Device removed')
            setConfirmDelete(null)
            fetchDevices()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Delete failed')
        } finally {
            setLoaderFor(confirmDelete?.id, null)
        }
    }

    const handleSaveDevice = async (formData, isEdit) => {
        try {
            if (isEdit) {
                await updateDevice(editDevice.id, formData)
                toast.success('Device updated')
                setEditDevice(null)
            } else {
                await registerDevice(formData)
                toast.success('Device registered')
                setShowRegister(false)
            }
            fetchDevices()
        } catch (err) {
            const msg = err.response?.data?.error
                || Object.values(err.response?.data || {})[0]
                || 'Save failed'
            throw new Error(msg)
        }
    }

    // ── Stats ─────────────────────────────────────────────────────────────────
    const stats = devices.reduce((acc, d) => {
        acc.total++
        acc[d.verificationStatus?.toLowerCase()]++
        return acc
    }, { total: 0, pending: 0, approved: 0, manual: 0 })

    const sortIcon = (f) => sort.field !== f ? '↕' : sort.dir === 'asc' ? '↑' : '↓'

    const fmtDate = (d) => d ? format(new Date(d), 'MMM d, yyyy') : '—'

    return (
        <AppLayout>
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="page-header">
                <div>
                    <div className="page-title">Gate Console</div>
                    <div className="page-subtitle">Device Registry & Exit Approval</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {user?.role !== 'ADMIN' && (
                        <button className="btn btn-primary" onClick={() => setShowRegister(true)}>
                            + Register Device
                        </button>
                    )}
                </div>
            </div>

            {/* ── Search ──────────────────────────────────────────────────── */}
            <div className="search-container">
                <div className="search-wrapper" ref={searchRef}>
                    <span className="search-icon">🔍</span>
                    <input
                        className="search-input"
                        placeholder="Search by serial number, device name, or owner name…"
                        value={search}
                        onChange={handleSearchChange}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="suggestions-dropdown">
                            {suggestions.map(s => (
                                <div key={s} className="suggestion-item" onMouseDown={() => pickSuggestion(s)}>
                                    {s}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {search && (
                    <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); fetchDevices('') }}>
                        Clear
                    </button>
                )}
            </div>

            {/* ── Stats Bar ───────────────────────────────────────────────── */}
            <div className="stats-bar">
                <div
                    className={`stat-chip total ${filter === 'ALL' ? 'active' : ''}`}
                    onClick={() => setFilter('ALL')}
                    style={{ cursor: 'pointer' }}
                >{stats.total} Total</div>
                <div
                    className={`stat-chip pending ${filter === 'PENDING' ? 'active' : ''}`}
                    onClick={() => setFilter('PENDING')}
                    style={{ cursor: 'pointer' }}
                >{stats.pending} Pending</div>
                <div
                    className={`stat-chip approved ${filter === 'APPROVED' ? 'active' : ''}`}
                    onClick={() => setFilter('APPROVED')}
                    style={{ cursor: 'pointer' }}
                >{stats.approved} Approved</div>
                <div
                    className={`stat-chip manual ${filter === 'MANUAL' ? 'active' : ''}`}
                    onClick={() => setFilter('MANUAL')}
                    style={{ cursor: 'pointer' }}
                >{stats.manual} Manual</div>
            </div>

            {/* ── Device Table ────────────────────────────────────────────── */}
            <div className="table-wrapper">
                <div className="device-table-container">
                    {loading ? (
                        <div className="loading-overlay"><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
                    ) : sorted.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-title">{search ? 'No results found' : 'No devices registered'}</div>
                            <div className="empty-desc">{search ? `Try a different search term` : 'Click "Register Device" to add the first device'}</div>
                        </div>
                    ) : (
                        <table className="device-table">
                            <thead>
                                <tr>
                                    {Object.entries(SORT_FIELDS).map(([field, label]) => (
                                        <th
                                            key={field}
                                            className={sort.field === field ? 'sorted' : ''}
                                            onClick={() => toggleSort(field)}
                                        >
                                            {label} {sortIcon(field)}
                                        </th>
                                    ))}
                                    <th>Type</th>
                                    <th>Reason</th>
                                    <th style={{ width: '220px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map(device => (
                                    <tr key={device.id}>
                                        <td>
                                            <div className="device-name">{device.deviceName}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{device.deviceType}</div>
                                        </td>
                                        <td><span className="serial-number">{device.serialNumber}</span></td>
                                        <td>
                                            <div className="owner-name">{device.ownerName || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>}</div>
                                            {device.ownerDepartment && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{device.ownerDepartment}</div>}
                                        </td>
                                        <td>{fmtDate(device.registrationDate)}</td>
                                        <td>
                                            <span className={`status-badge ${device.verificationStatus}`}>
                                                {device.verificationStatus}
                                            </span>
                                            {device.verifiedBy && (
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>by {device.verifiedBy}</div>
                                            )}
                                        </td>
                                        <td>{device.deviceType}</td>
                                        <td>{REASON_LABELS[device.reason] || device.reason}</td>
                                        <td>
                                            <div className="action-buttons">
                                                {/* Approve & Manual - only show if PENDING */}
                                                {device.verificationStatus === 'PENDING' ? (
                                                    user?.role !== 'ADMIN' ? (
                                                        <>
                                                            <button
                                                                className="btn btn-success btn-sm"
                                                                title="Approve Exit"
                                                                disabled={!!actionLoading[device.id]}
                                                                onClick={() => handleApprove(device)}
                                                            >
                                                                {actionLoading[device.id] === 'approve' ? <span className="spinner" /> : 'Approve'}
                                                            </button>

                                                            <button
                                                                className="btn btn-warning btn-sm"
                                                                title="Manual Verification"
                                                                disabled={!!actionLoading[device.id]}
                                                                onClick={() => handleManual(device)}
                                                            >
                                                                {actionLoading[device.id] === 'manual' ? <span className="spinner" /> : 'Manual'}
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div style={{
                                                            color: 'var(--status-pending)',
                                                            fontSize: '12px',
                                                            fontWeight: '500',
                                                            padding: '6px 0'
                                                        }}>
                                                            Awaiting Officer
                                                        </div>
                                                    )
                                                ) : (
                                                    <div style={{
                                                        color: device.verificationStatus === 'APPROVED' ? 'var(--accent-green)' : 'var(--accent-blue)',
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '6px 0'
                                                    }}>
                                                        {device.verificationStatus === 'APPROVED' ? 'Approved ✓' : 'Verified'}
                                                    </div>
                                                )}

                                                {/* Edit & Delete — only for PENDING devices */}
                                                {user?.role !== 'ADMIN' && device.verificationStatus === 'PENDING' && (
                                                    <>
                                                        {/* Edit */}
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            title="Edit Device"
                                                            disabled={!!actionLoading[device.id]}
                                                            onClick={() => setEditDevice(device)}
                                                        >
                                                            Edit
                                                        </button>

                                                        {/* Delete */}
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            title="Delete Device"
                                                            disabled={!!actionLoading[device.id]}
                                                            onClick={() => setConfirmDelete(device)}
                                                        >
                                                            {actionLoading[device.id] === 'delete' ? <span className="spinner" /> : 'Delete'}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ── Modals ──────────────────────────────────────────────────── */}
            {
                showRegister && (
                    <DeviceModal
                        title="Register New Device"
                        onClose={() => setShowRegister(false)}
                        onSave={(data) => handleSaveDevice(data, false)}
                    />
                )
            }

            {
                editDevice && (
                    <DeviceModal
                        title="Edit Device"
                        device={editDevice}
                        onClose={() => setEditDevice(null)}
                        onSave={(data) => handleSaveDevice(data, true)}
                    />
                )
            }

            {
                confirmDelete && (
                    <ConfirmModal
                        title="Delete Device"
                        message={<>Are you sure you want to delete <strong>{confirmDelete.deviceName}</strong> (<span style={{ color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{confirmDelete.serialNumber}</span>)? This action cannot be undone.</>}
                        danger
                        loading={!!actionLoading[confirmDelete?.id]}
                        onConfirm={handleDelete}
                        onClose={() => setConfirmDelete(null)}
                    />
                )
            }
        </AppLayout >
    )
}
