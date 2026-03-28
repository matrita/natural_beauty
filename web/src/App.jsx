import { useState } from 'react'
import './App.css'
import { useAuth } from './context/AuthContext'
import AuthView from './views/AuthView'
import ClientiView from './views/ClientiView'
import OperatoriView from './views/OperatoriView'
import TrattamentiView from './views/TrattamentiView'
import AppuntamentiView from './views/AppuntamentiView'
import UtentiView from './views/UtentiView'
import Layout from './ui/Layout'

const TABS = [
  { id: 'trattamenti', label: 'Trattamenti', View: TrattamentiView, roles: ['CLIENTE', 'STAFF', 'ADMIN'] },
  { id: 'appuntamenti', label: 'Appuntamenti', View: AppuntamentiView, roles: ['CLIENTE', 'STAFF', 'ADMIN'] },
  { id: 'clienti', label: 'Clienti', View: ClientiView, roles: ['STAFF', 'ADMIN'] },
  { id: 'operatori', label: 'Operatori', View: OperatoriView, roles: ['STAFF', 'ADMIN'] },
  { id: 'utenti', label: 'Utenti', View: UtentiView, roles: ['ADMIN'] },
]

export default function App() {
  const { isAuthenticated, user, logout } = useAuth()
  const [activeTabId, setActiveTabId] = useState('trattamenti')
  const role = user?.ruolo || 'CLIENTE'
  const allowedTabs = TABS.filter((t) => t.roles.includes(role))
  const currentTab = allowedTabs.find((t) => t.id === activeTabId) ?? allowedTabs[0]
  const View = currentTab?.View

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
    <Layout tabs={allowedTabs} activeTabId={currentTab.id} onTabChange={setActiveTabId}>
      <View />
    </Layout>
  )
}
