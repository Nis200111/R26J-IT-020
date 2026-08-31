export default function UserBubble({ text, imageUrl }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] overflow-hidden rounded-2xl bg-zinc-800">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="Uploaded"
            className="max-h-56 w-full object-cover"
          />
        )}
        {text && (
          <div className="whitespace-pre-wrap px-4 py-2.5 text-sm text-zinc-100">
            {text}
          </div>
        )}
      </div>
    </div>
  );
}
