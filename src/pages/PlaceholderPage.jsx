export function PlaceholderPage({ eyebrow, title, description }) {
  return (
    <section className="animate-[fade-in_400ms_ease-out]">
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#719b35]">{eyebrow}</p>
      <div className="max-w-3xl">
        <h1 className="font-display text-4xl font-bold tracking-tight text-[#18221d] sm:text-6xl">{title}</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#718078] sm:text-lg">{description}</p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {[['01', 'Build your baseline'], ['02', 'Stay consistent'], ['03', 'See the change']].map(([number, label]) => (
          <div key={number} className="rounded-2xl border border-[#dfe6d9] bg-white p-5">
            <span className="font-mono text-xs text-[#9cad9a]">{number}</span>
            <p className="mt-8 font-display text-lg font-semibold text-[#18221d]">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
