import Input from '../../ui/Input'

export default function PeriodSelector({ da, a, onDaChange, onAChange, onReload, title = "Periodo" }) {
  return (
    <div className="panel panel--inner filter-bar">
      <h3>{title}</h3>
      <div className="form-grid form-grid--compact">
        <Input
          label="Da"
          type="datetime-local"
          value={da}
          onChange={(e) => onDaChange(e.target.value)}
        />
        <Input
          label="A"
          type="datetime-local"
          value={a}
          onChange={(e) => onAChange(e.target.value)}
        />
        <div className="form-actions">
          <button type="button" className="btn btn--primary" onClick={onReload}>
            Aggiorna elenco
          </button>
        </div>
      </div>
    </div>
  )
}
