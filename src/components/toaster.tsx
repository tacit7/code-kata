import { useToastStore } from "../stores/toast-store";

const alertClass: Record<string, string> = {
  error: "bg-base-100 text-base-content border-error/35",
  warning: "bg-base-100 text-base-content border-warning/35",
  success: "bg-base-100 text-base-content border-success/35",
  info: "bg-base-100 text-base-content border-info/35",
};

const dotClass: Record<string, string> = {
  error: "bg-error",
  warning: "bg-warning",
  success: "bg-success",
  info: "bg-info",
};

export function Toaster() {
  const { toasts, remove } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast toast-bottom toast-end z-[9999] pointer-events-none">
      {toasts.map((t) => (
        <button
          type="button"
          key={t.id}
          className={`pointer-events-auto flex min-w-64 max-w-sm items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm shadow-lg shadow-base-300/20 backdrop-blur animate-fade-in ${alertClass[t.type]}`}
          onClick={() => remove(t.id)}
          aria-label={`Dismiss notification: ${t.message}`}
        >
          <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass[t.type]}`} />
          <span>{t.message}</span>
        </button>
      ))}
    </div>
  );
}
