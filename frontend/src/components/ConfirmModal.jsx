"use client"

export default function ConfirmModal({ title, message, danger, loading, onConfirm, onClose }) {
    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <span className="modal-title">{title}</span>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <div className="confirm-message">{message}</div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
                    <button
                        className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? <><span className="spinner" /> Please wait…</> : danger ? 'Delete' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    )
}
