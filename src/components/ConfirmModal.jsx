import React, { useState } from 'react';

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content confirm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className="modal-body" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>{message}</p>
          <div className="modal-actions" style={{ justifyContent: 'center', gap: '1rem' }}>
            <button className="btn-secondary" onClick={onCancel} disabled={loading}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={handleConfirm} disabled={loading}>
              {loading ? 'Procesando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
