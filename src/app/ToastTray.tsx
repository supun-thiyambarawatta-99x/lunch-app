import type { Toast } from "./useToast";

export function ToastTray({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-tray" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <p key={toast.id} className={`toast toast-${toast.type}`} data-testid={`toast-${toast.type}`}>
          {toast.text}
        </p>
      ))}
    </div>
  );
}
