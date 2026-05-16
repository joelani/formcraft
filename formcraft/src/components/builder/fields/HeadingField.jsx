export default function HeadingField({ field }) {
  return (
    <div>
      <h2 className="truncate text-xl font-semibold text-text-primary">{field.label}</h2>
      {field.placeholder ? (
        <p className="mt-1 text-sm text-text-muted">{field.placeholder}</p>
      ) : null}
    </div>
  )
}
