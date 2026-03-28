import { useState } from 'react'
import Input from './Input'

export default function PasswordDialog({ open, email, showOldPassword = false, onCancel, onConfirm }) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  if (!open) return null

  function handleSubmit(e) {
    e.preventDefault()
    
    // Passiamo tutti i campi al componente padre per la validazione centralizzata
    if (showOldPassword) {
      onConfirm(oldPassword, newPassword, confirm)
    } else {
      onConfirm(newPassword, confirm)
    }
    reset()
  }

  function reset() {
    setOldPassword('')
    setNewPassword('')
    setConfirm('')
  }

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal__dialog panel">
        <h2 className="modal__title">Reimposta password</h2>
        <p className="modal__message">Utente: <strong>{email}</strong></p>
        
        <form onSubmit={handleSubmit} className="login__form">
          {showOldPassword && (
            <Input
              label="Password attuale"
              type="password"
              required
              fullWidth
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          )}
          <Input
            label="Nuova password"
            type="password"
            required
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            label="Conferma nuova password"
            type="password"
            required
            fullWidth
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          
          <div className="modal__actions">
            <button type="button" className="btn" onClick={() => { reset(); onCancel(); }}>Annulla</button>
            <button type="submit" className="btn btn--primary">Salva nuova password</button>
          </div>
        </form>
      </div>
    </div>
  )
}
