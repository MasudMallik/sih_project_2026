import { useCallback, useState } from "react";
import type { ToastData, ToastType } from "../@types/interface/toast";

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message: string) => {
    const id = Date.now();
    setToasts((current) => [...current, { id, type, title, message }]);
    window.setTimeout(() => dismissToast(id), 5000);
  }, [dismissToast]);

  return { toasts, showToast, dismissToast };
}