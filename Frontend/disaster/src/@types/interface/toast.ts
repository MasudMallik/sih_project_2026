export type ToastType = "success" | "warning" | "error";

export interface ToastData {
  id: number;
  type: ToastType;
  title: string;
  message: string;
}