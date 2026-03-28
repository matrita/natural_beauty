import { useEffect, useRef } from 'react'

export default function ConfirmDialog({
  open,
  title = 'Conferma',
  message,
  confirmLabel = 'Conferma',
  cancelLabel = 'Annulla',
  danger = false,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => confirmRef.current?.focus(), 0)
    function onKeyDown(e) {
      if (e.key === 'Escape') onCancel?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="modal" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onCancel?.()}>
      <div className="modal__dialog panel" role="dialog" aria-modal="true" aria-label={title}>
        <h3 className="modal__title">{title}</h3>
        {message && <div className="modal__message">{message}</div>}
        <div className="modal__actions">
          <button type="button" className="btn" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={danger ? 'btn btn--danger-solid' : 'btn btn--primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
