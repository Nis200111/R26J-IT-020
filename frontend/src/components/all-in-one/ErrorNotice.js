import { AlertTriangle, RotateCw } from "lucide-react";

export default function ErrorNotice({ message, onRetry }) {
  return (
    <div className="rounded-3xl border border-red-500/30 bg-red-500/5 p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
        <div className="flex-1">
          <p className="text-sm leading-relaxed text-red-200">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-red-500/30 px-3 py-1 text-xs font-bold text-red-300 transition-colors hover:bg-red-500/10"
            >
              <RotateCw className="h-3 w-3" />
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
