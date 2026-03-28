import { useState } from 'react'
import './App.css'
import { useAuth } from './context/AuthContext'
import AuthView from './views/AuthView'
import ClientiView from './views/ClientiView'
import OperatoriView from './views/OperatoriView'
import TrattamentiView from './views/TrattamentiView'
import AppuntamentiView from './views/AppuntamentiView'
import UtentiView from './views/UtentiView'

const TABS = [
  { id: 'trattamenti', label: 'Trattamenti', View: TrattamentiView, roles: ['CLIENTE', 'STAFF', 'ADMIN'] },
  { id: 'appuntamenti', label: 'Appuntamenti', View: AppuntamentiView, roles: ['CLIENTE', 'STAFF', 'ADMIN'] },
  { id: 'clienti', label: 'Clienti', View: ClientiView, roles: ['STAFF', 'ADMIN'] },
  { id: 'operatori', label: 'Operatori', View: OperatoriView, roles: ['STAFF', 'ADMIN'] },
  { id: 'utenti', label: 'Utenti', View: UtentiView, roles: ['ADMIN'] },
]

export default function App() {
  const { isAuthenticated, user, logout } = useAuth()
  const [tab, setTab] = useState('trattamenti')
  const role = user?.ruolo || 'CLIENTE'
  const allowedTabs = TABS.filter((t) => (t.roles ? t.roles.includes(role) : true))
  const active = allowedTabs.find((t) => t.id === tab) ?? allowedTabs[0]
  const View = active?.View

  if (!isAuthenticated) {
    return <AuthView />
  }

  if (!View) {
    return (
      <div className="app">
        <div className="panel">
          <h1>Natural Beauty</h1>
          <p className="muted">Sessione non valida (ruolo mancante o non supportato).</p>
          <button type="button" className="btn btn--primary" onClick={logout}>
            Esci
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
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
            <button type="button" className="btn btn--small" onClick={logout}>
              Esci
            </button>
          </div>
        </div>
      </header>

      <nav className="tabs" aria-label="Sezioni applicazione">
        {allowedTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tabs__btn${tab === t.id ? ' tabs__btn--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <section className="panel panel--main" aria-labelledby={`tab-${active.id}`}>
        <h2 id={`tab-${active.id}`} className="panel__title">
          {active.label}
        </h2>
        <View />
      </section>
    </div>
  )
}
