"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: "state-success glass",
  error: "state-error glass",
  warning: "state-warning glass",
  info: "state-info glass",
};

const iconStyles = {
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
  warning: "text-amber-600 dark:text-amber-400",
  info: "text-blue-600 dark:text-blue-400",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const Icon = toastIcons[toast.type];

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border-2 shadow-2xl animate-slide-in-right ${toastStyles[toast.type]}`}
      role="alert"
    >
      <div className={`p-2 rounded-lg ${toast.type === 'success' ? 'bg-green-100 dark:bg-green-900/50' : toast.type === 'error' ? 'bg-red-100 dark:bg-red-900/50' : toast.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-blue-100 dark:bg-blue-900/50'}`}>
        <Icon className={`w-5 h-5 flex-shrink-0 ${iconStyles[toast.type]} ${toast.type === 'success' ? 'animate-success' : ''}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 dark:text-white">{toast.title}</p>
        {toast.message && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="btn-icon flex-shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after duration (default 5 seconds)
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      {/* Toast Container */}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-96 max-w-[calc(100vw-2rem)]"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
