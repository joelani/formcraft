export default function HeadingField({ field }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-950">{field.label}</h2>
      {field.placeholder ? (
        <p className="mt-1 text-sm text-slate-500">{field.placeholder}</p>
      ) : null}
    </div>
  )
}
