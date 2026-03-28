export default function Input({ label, error, fullWidth, ...props }) {
  return (
    <label className={`field ${fullWidth ? 'field--full' : ''}`}>
      {label && <span>{label}</span>}
      <input {...props} />
      {error && <p className="error">{error}</p>}
    </label>
  )
}
