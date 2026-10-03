export default function OperatoreCard({ operatore, onEdit, onDelete }) {
  return (
    <div className="list-row" style={{ padding: '1.5rem 0' }}>
      <div className="list-row__main" style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.4rem' }}>
          <span className="name" style={{ fontSize: '1.15rem', color: 'var(--brand)' }}>
            {operatore.nome} {operatore.cognome}
          </span>
          {!operatore.attivo && (
            <span className="badge" style={{ background: '#ffebeb', color: '#d63031' }}>
              Non attivo
            </span>
          )}
        </div>
        <div className="meta" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {operatore.specializzazioni ? (
            <span style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>
              ✨ {operatore.specializzazioni}
            </span>
          ) : (
            <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Nessuna specializzazione specificata</span>
          )}
        </div>
      </div>
      
      <div className="list-row__actions" style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" className="btn btn--small" onClick={() => onEdit(operatore)}>
          Modifica
        </button>
        <button type="button" className="btn btn--small btn--danger" onClick={() => onDelete(operatore)}>
          Elimina
        </button>
      </div>
    </div>
  )
}
