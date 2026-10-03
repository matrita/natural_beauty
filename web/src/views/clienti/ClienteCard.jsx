export default function ClienteCard({ cliente, onEdit, onDelete }) {
  return (
    <div className="list-row" style={{ padding: '1.5rem 0' }}>
      <div className="list-row__main" style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.4rem' }}>
          <span className="name" style={{ fontSize: '1.15rem', color: 'var(--brand)' }}>
            {cliente.nome} {cliente.cognome}
          </span>
        </div>
        <div className="meta" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ color: 'var(--text)', fontSize: '0.9rem' }}>📧 {cliente.email}</span>
          {cliente.telefono && (
            <span style={{ fontSize: '0.85rem' }}>📞 {cliente.telefono}</span>
          )}
          {cliente.note && (
            <p style={{ fontStyle: 'italic', fontSize: '0.85rem', marginTop: '0.3rem', color: 'var(--muted)' }}>
              📝 {cliente.note}
            </p>
          )}
        </div>
      </div>
      
      <div className="list-row__actions" style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" className="btn btn--small" onClick={() => onEdit(cliente)}>
          Modifica
        </button>
        <button type="button" className="btn btn--small btn--danger" onClick={() => onDelete(cliente)}>
          Elimina
        </button>
      </div>
    </div>
  )
}
