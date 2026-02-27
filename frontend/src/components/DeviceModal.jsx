"use client"

import { useState } from 'react'

const EMPTY = {
    deviceName: '', deviceType: 'Laptop', serialNumber: '',
    personId: '', ownerName: '', ownerIdentifier: '',
    ownerType: 'EMPLOYEE', ownerDepartment: '',
    reason: 'WORK', notes: '', supportingDocument: '',
}

const F = ({ name, label, required, children, errors }) => (
    <div className="form-group">
        <label className="form-label">
            {label}{required && <span className="required">*</span>}
        </label>
        {children}
        {errors[name] && <span className="form-error">{errors[name]}</span>}
    </div>
)

export default function DeviceModal({ title, device, onClose, onSave }) {
    const [form, setForm] = useState(() => device
        ? {
            deviceName: device.deviceName || '',
            deviceType: device.deviceType || '',
            serialNumber: device.serialNumber || '',
            personId: device.personId || '',
            ownerName: device.ownerName || '',
            ownerIdentifier: '',
            ownerType: device.ownerType || 'EMPLOYEE',
            ownerDepartment: device.ownerDepartment || '',
            reason: device.reason || 'WORK',
            notes: device.notes || '',
            supportingDocument: device.supportingDocument || '',
        }
        : { ...EMPTY }
    )
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)

    const set = (key, val) => {
        setForm(f => ({ ...f, [key]: val }))
        setErrors(e => ({ ...e, [key]: undefined }))
    }

    const validate = () => {
        const errs = {}
        if (!form.deviceName.trim()) errs.deviceName = 'Required'
        if (!form.deviceType.trim()) errs.deviceType = 'Required'
        if (!form.serialNumber.trim()) errs.serialNumber = 'Required'
        if (!form.reason) errs.reason = 'Required'
        if (!form.personId && !form.ownerName.trim()) errs.ownerName = 'Required (or select existing)'
        return errs
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length > 0) { setErrors(errs); return }

        setSaving(true)
        try {
            const payload = {
                deviceName: form.deviceName.trim(),
                deviceType: form.deviceType.trim(),
                serialNumber: form.serialNumber.trim(),
                reason: form.reason,
                notes: form.notes,
                supportingDocument: form.supportingDocument,
                ...(form.personId
                    ? { personId: Number(form.personId) }
                    : {
                        ownerName: form.ownerName.trim(),
                        ownerIdentifier: form.ownerIdentifier.trim(),
                        ownerType: form.ownerType,
                        ownerDepartment: form.ownerDepartment.trim(),
                    }
                ),
            }
            await onSave(payload)
        } catch (err) {
            setErrors({ _global: err.message })
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal modal-lg">
                <div className="modal-header">
                    <span className="modal-title">{title}</span>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {/* Device Info */}
                        <div className="section-label">Device Information</div>
                        <div className="form-grid">
                            <F name="deviceName" label="Device Name" required errors={errors}>
                                <input className={`form-control${errors.deviceName ? ' error' : ''}`}
                                    placeholder="e.g. MacBook Pro" value={form.deviceName}
                                    onChange={e => set('deviceName', e.target.value)} />
                            </F>
                            <F name="deviceType" label="Device Type" required errors={errors}>
                                <select className="form-control" value={form.deviceType}
                                    onChange={e => set('deviceType', e.target.value)}>
                                    <option value="">Select type…</option>
                                    <option>Laptop</option>
                                    <option>Mobile Phone</option>
                                    <option>Tablet</option>
                                    <option>Camera</option>
                                    <option>Hard Drive</option>
                                    <option>USB Drive</option>
                                    <option>Other</option>
                                </select>
                            </F>
                            <F name="serialNumber" label="Serial Number" required errors={errors}>
                                <input className="form-control"
                                    placeholder="e.g. SN-2024-XXXXX" value={form.serialNumber}
                                    onChange={e => set('serialNumber', e.target.value)} />
                            </F>
                            <F name="reason" label="Reason" required errors={errors}>
                                <select className="form-control" value={form.reason}
                                    onChange={e => set('reason', e.target.value)}>
                                    <option value="WORK">Work</option>
                                    <option value="REWARD">Reward</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </F>
                            <F name="notes" label="Notes" errors={errors}>
                                <textarea className="form-control span-2" placeholder="Additional notes…"
                                    value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
                            </F>
                            <F name="supportingDocument" label="Supporting Document" errors={errors}>
                                <input className="form-control" placeholder="Document reference or filename"
                                    value={form.supportingDocument}
                                    onChange={e => set('supportingDocument', e.target.value)} />
                            </F>
                        </div>

                        <hr className="divider" />

                        {/* Owner Info */}
                        <div className="section-label">Owner Information</div>
                        <div className="form-grid">
                            <F name="ownerName" label="Owner Full Name" required errors={errors}>
                                <input className="form-control"
                                    placeholder="e.g. Abebe Kebede" value={form.ownerName}
                                    onChange={e => set('ownerName', e.target.value)} />
                            </F>
                            <F name="ownerType" label="Owner Type" errors={errors}>
                                <select className="form-control" value={form.ownerType}
                                    onChange={e => set('ownerType', e.target.value)}>
                                    <option value="EMPLOYEE">Employee</option>
                                    <option value="GUEST">Guest</option>
                                </select>
                            </F>
                            <F name="ownerIdentifier" label="Employee/Guest ID" errors={errors}>
                                <input className="form-control" placeholder="EMP-001 or ID number"
                                    value={form.ownerIdentifier}
                                    onChange={e => set('ownerIdentifier', e.target.value)} />
                            </F>
                            <F name="ownerDepartment" label="Department" errors={errors}>
                                <input className="form-control" placeholder="e.g. Engineering"
                                    value={form.ownerDepartment}
                                    onChange={e => set('ownerDepartment', e.target.value)} />
                            </F>
                        </div>

                        {errors._global && (
                            <div style={{
                                marginTop: '16px',
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.25)',
                                color: 'var(--accent-red)',
                                padding: '10px 14px',
                                borderRadius: 'var(--r1)',
                                fontSize: '13px',
                            }}>
                                {errors._global}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? <><span className="spinner" /> Saving…</> : device ? 'Save Changes' : 'Register Device'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
