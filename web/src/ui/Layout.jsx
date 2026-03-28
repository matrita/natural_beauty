import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import ConfirmDialog from './ConfirmDialog'
import PasswordDialog from './PasswordDialog'
import FeedbackModal from './FeedbackModal'

export default function Layout({ children, tabs, activeTabId, onTabChange }) {
  const { user, logout, deleteAccount, changePassword } = useAuth()
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [feedback, setFeedback] = useState(null)
  
  const role = user?.ruolo || 'CLIENTE'
  const activeTab = tabs.find((t) => t.id === activeTabId)

  async function handlePasswordChange(oldPwd, newPwd, confirmPwd) {
    // 1. Controllo coincidenza password (mostrato tramite FeedbackModal)
    if (newPwd !== confirmPwd) {
      setFeedback({
        title: 'Nuova password non valida',
        message: 'Le due nuove password inserite non corrispondono. Riprova.',
        type: 'error'
      })
      return
    }

    // 2. Controllo lunghezza minima
    if (newPwd.length < 4) {
      setFeedback({
        title: 'Nuova password troppo corta',
        message: 'La nuova password deve contenere almeno 4 caratteri.',
        type: 'error'
      })
      return
    }

    // 3. Esecuzione chiamata API
    try {
      await changePassword(oldPwd, newPwd)
      setChangePasswordOpen(false)
      setFeedback({
        title: 'Password aggiornata',
        message: 'La tua password è stata modificata con successo.',
        type: 'success'
      })
    } catch (e) {
      setFeedback({
        title: 'Errore cambio password',
        message: e.message || 'La password attuale è errata o si è verificato un errore di rete.',
        type: 'error'
      })
    }
  }

  return (
    <div className="app">
      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Eliminare l'account?"
        message={
          <>
            <div>Questa operazione elimina definitivamente il tuo account e i tuoi appuntamenti associati.</div>
            <div>Non potrai recuperare i dati.</div>
          </>
        }
        confirmLabel="Si, elimina"
        cancelLabel="No"
        danger
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={async () => {
          setConfirmDeleteOpen(false)
          await deleteAccount()
        }}
      />

      <PasswordDialog
        open={changePasswordOpen}
        email={user?.email}
        showOldPassword={true}
        onCancel={() => setChangePasswordOpen(false)}
        onConfirm={handlePasswordChange}
      />

      <FeedbackModal
        open={!!feedback}
        title={feedback?.title}
        message={feedback?.message}
        type={feedback?.type}
        onClose={() => setFeedback(null)}
      />

      <header className="hero hero--app">
        <div className="hero__top">
          <div>
            <p className="eyebrow">Centro estetico</p>
            <h1>Natural Beauty</h1>
          </div>
          <div className="user-bar">
            <span className="user-bar__info">
              {user?.email}
              {user?.ruolo && <span className="user-bar__role">{user.ruolo}</span>}
            </span>
            
            <button
              type="button"
              className="btn btn--small"
              onClick={() => setChangePasswordOpen(true)}
            >
              Cambia Password
            </button>

            {role === 'CLIENTE' && (
              <button
                type="button"
                className="btn btn--small btn--danger"
                onClick={() => setConfirmDeleteOpen(true)}
              >
                Elimina account
              </button>
            )}
            <button type="button" className="btn btn--small" onClick={logout}>
              Esci
            </button>
          </div>
        </div>
      </header>

      <nav className="tabs" aria-label="Sezioni applicazione">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tabs__btn${activeTabId === t.id ? ' tabs__btn--active' : ''}`}
            onClick={() => onTabChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <section className="panel panel--main" aria-labelledby={`tab-${activeTabId}`}>
        <h2 id={`tab-${activeTabId}`} className="panel__title">
          {activeTab?.label}
        </h2>
        {children}
      </section>
    </div>
  )
}
