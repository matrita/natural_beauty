export default function TrattamentoCard({ trattamento, isCliente, onEdit, onDelete }) {
  return (
    <div className="list-row" style={{ padding: '1.5rem 0' }}>
      <div className="list-row__main" style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span className="name" style={{ fontSize: '1.2rem', color: 'var(--brand)' }}>{trattamento.nome}</span>
          {!trattamento.attivo && (
            <span className="badge badge--off" style={{ background: '#ffebeb', color: '#d63031' }}>Non attivo</span>
          )}
        </div>
        <p className="meta" style={{ color: 'var(--muted)', fontSize: '0.95rem', maxWidth: '80%' }}>
          {trattamento.descrizione || 'Nessuna descrizione disponibile.'}
        </p>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.8rem', minWidth: '120px' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prezzo:</span>
          <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent)' }}>
            € {trattamento.prezzo}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Durata:</span>
          <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--brand)' }}>
            {trattamento.durataMinuti} min
          </span>
        </div>
        
        {!isCliente && (
          <div className="list-row__actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn--small" onClick={() => onEdit(trattamento)}>
                Modifica
            </button>
            <button type="button" className="btn btn--small btn--danger" onClick={() => onDelete(trattamento)}>
                Elimina
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
