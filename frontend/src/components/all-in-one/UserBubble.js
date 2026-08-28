export default function UserBubble({ text }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100">
        {text}
      </div>
    </div>
  );
}
