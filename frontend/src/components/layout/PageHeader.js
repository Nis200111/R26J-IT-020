export default function PageHeader({ eyebrow, title, accent, description, image }) {
  return (
    <div className="relative overflow-hidden bg-zinc-950 border-b border-zinc-800">
      {image && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${image})` }}
        ></div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/40 z-1"></div>

      <div className="container relative z-10 mx-auto px-6 py-16 max-w-5xl">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-[1px] w-6 bg-[#c5a880]"></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#c5a880]">{eyebrow}</span>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight leading-tight text-white">
          {title} {accent && <span className="italic text-[#c5a880] font-light">{accent}</span>}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-sm md:text-base text-zinc-300 font-light leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
