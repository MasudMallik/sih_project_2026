import type { ToastData } from "../../@types/interface/toast";

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: number) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed right-4 top-4 z-50 flex w-[min(360px,calc(100%-2rem))] flex-col gap-3" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className="rounded-lg border border-white/15 bg-[#102117] p-4 text-[#F4EFE6] shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">{toast.title}</p>
              <p className="mt-1 text-xs text-[#B7CBB2]">{toast.message}</p>
            </div>
            <button type="button" onClick={() => onDismiss(toast.id)} className="text-lg leading-none text-[#B7CBB2] hover:text-white" aria-label="Dismiss notification">
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}