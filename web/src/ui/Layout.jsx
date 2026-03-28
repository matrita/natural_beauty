import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import ConfirmDialog from './ConfirmDialog'

export default function Layout({ children, tabs, activeTabId, onTabChange }) {
  const { user, logout, deleteAccount } = useAuth()
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  
  const role = user?.ruolo || 'CLIENTE'
  const activeTab = tabs.find((t) => t.id === activeTabId)

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
