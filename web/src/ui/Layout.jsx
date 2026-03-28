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
  
  // Se nome e cognome sono presenti, mostriamo quelli, altrimenti fallback sull'email
  const displayName = user?.nome ? `${user.nome} ${user.cognome}` : user?.email;

  async function handlePasswordChange(oldPwd, newPwd, confirmPwd) {
    if (newPwd !== confirmPwd) {
      setFeedback({ title: 'Errore', message: 'Le nuove password non corrispondono.', type: 'error' })
      return
    }
    if (newPwd.length < 4) {
      setFeedback({ title: 'Errore', message: 'La password deve contenere almeno 4 caratteri.', type: 'error' })
      return
    }

    try {
      await changePassword(oldPwd, newPwd)
      setChangePasswordOpen(false)
      setFeedback({ title: 'Successo', message: 'Password aggiornata correttamente.', type: 'success' })
    } catch (e) {
      setFeedback({ title: 'Errore', message: e.message || 'Errore durante il cambio password.', type: 'error' })
    }
  }

  return (
    <div className="app">
      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Eliminare l'account?"
        message="Questa operazione è definitiva. Vuoi procedere?"
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
              <strong style={{ color: 'var(--brand)' }}>{displayName}</strong>
              {user?.ruolo && <span className="user-bar__role">{user.ruolo}</span>}
            </span>
            
            <button type="button" className="btn btn--small" onClick={() => setChangePasswordOpen(true)}>
              Cambia Password
            </button>

            {role === 'CLIENTE' && (
              <button type="button" className="btn btn--small btn--danger" onClick={() => setConfirmDeleteOpen(true)}>
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
