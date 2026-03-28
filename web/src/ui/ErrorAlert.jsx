export default function ErrorAlert({ error, onDismiss }) {
  if (!error) return null
  const msg = error.message || String(error)
  return (
    <div className="alert alert--error" role="alert">
      <span>{msg}</span>
      {onDismiss && (
        <button type="button" className="btn btn--ghost btn--small" onClick={onDismiss}>
          Chiudi
        </button>
      )}
    </div>
  )
}
