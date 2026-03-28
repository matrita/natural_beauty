import React from 'react'

function clearSession() {
  try {
    sessionStorage.removeItem('nb_token')
    sessionStorage.removeItem('nb_profile')
  } catch {
    /* ignora */
  }
}

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Log utile per il debug dalla console (F12).
    console.error('Errore applicazione:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    const msg = this.state.error?.message || String(this.state.error)
    return (
      <div className="login">
        <div className="login__card panel">
          <h1 className="login__title">Natural Beauty</h1>
          <p className="login__subtitle">Errore applicazione</p>
          <p className="error" style={{ whiteSpace: 'pre-wrap' }}>
            {msg}
          </p>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                clearSession()
                window.location.reload()
              }}
            >
              Reset sessione
            </button>
          </div>
          <p className="muted login__hint">Apri la console del browser per i dettagli (F12).</p>
        </div>
      </div>
    )
  }
}
