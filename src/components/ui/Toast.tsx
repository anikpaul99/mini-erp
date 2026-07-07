/* ============================================================
 * UI — Toast System
 * ============================================================
 * Custom toast system using global CSS classes.
 * Matches Design Bible §4.12 exactly.
 * ============================================================ */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "danger" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  addToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const ICONS = {
  success: CheckCircle2,
  danger: XCircle,
  info: Info,
};

const AUTO_DISMISS_MS: Record<ToastType, number | null> = {
  success: 4000,
  info: 4000,
  danger: null, // persist until dismissed
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [exiting, setExiting] = useState<Set<string>>(new Set());

  const removeToast = useCallback((id: string) => {
    setExiting((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      setExiting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 220); // match --duration-modal
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message }]);

      const autoDismiss = AUTO_DISMISS_MS[type];
      if (autoDismiss) {
        setTimeout(() => removeToast(id), autoDismiss);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="erp-toast-container" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type];
          const isExiting = exiting.has(toast.id);
          return (
            <div
              key={toast.id}
              className={`erp-toast${isExiting ? " erp-toast--exiting" : ""}`}
              role="alert"
            >
              <div className={`erp-toast__bar erp-toast__bar--${toast.type}`} />
              <Icon
                className={`erp-toast__icon erp-toast__icon--${toast.type}`}
              />
              <span className="erp-toast__message">{toast.message}</span>
              <button
                className="erp-toast__close"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
              >
                <X className="erp-toast__close" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
