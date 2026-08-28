export default function Greeting({ model }) {
  const Icon = model.icon;
  return (
    <div className="flex flex-col items-center px-6 text-center">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-[#c5a880]">
        <Icon className="h-6 w-6" />
      </div>
      <h1 className="font-serif text-3xl font-light text-zinc-100 sm:text-4xl">
        Bio-Heritage <span className="italic text-[#c5a880]">AI</span>
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
        {model.blurb}
      </p>
    </div>
  );
}
