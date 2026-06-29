import { useToastStore } from "../stores/toast-store";

const alertClass: Record<string, string> = {
  error: "alert-error",
  warning: "alert-warning",
  success: "alert-success",
  info: "alert-info",
};

export function Toaster() {
  const { toasts, remove } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast toast-top toast-end z-[9999] pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`alert ${alertClass[t.type]} shadow-lg pointer-events-auto text-sm py-2.5 px-4 flex items-center gap-2 animate-fade-in`}
          onClick={() => remove(t.id)}
        >
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
