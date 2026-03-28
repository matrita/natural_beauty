export default function FeedbackModal({ open, title, message, type = 'success', onClose }) {
  if (!open) return null

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal__dialog panel">
        <h2 className={`modal__title ${type === 'error' ? 'error' : ''}`} style={{ color: type === 'error' ? 'var(--danger)' : '#2c3329' }}>
          {title || (type === 'success' ? 'Operazione completata' : 'Errore')}
        </h2>
        <div className="modal__message" style={{ marginTop: '0.5rem' }}>
          {message}
        </div>
        <div className="modal__actions" style={{ marginTop: '1.5rem' }}>
          <button type="button" className="btn btn--primary" onClick={onClose}>
            Chiudi
          </button>
        </div>
      </div>
    </div>
  )
}
