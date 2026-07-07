/* ============================================================
 * UI — Drawer
 * ============================================================
 * Design Bible §4.10. Slide-from-right for detail views.
 * ============================================================ */

import { useEffect, useRef, useCallback, useState, type ReactNode } from "react";
import { X } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
}: DrawerProps) {
  const [closing, setClosing] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 220);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen && !closing) return null;

  return (
    <>
      <div
        ref={overlayRef}
        className={`erp-drawer-overlay${closing ? " erp-drawer-overlay--closing" : ""}`}
        onClick={handleClose}
      />
      <div
        ref={drawerRef}
        className={`erp-drawer${closing ? " erp-drawer--closing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <div className="erp-drawer__header">
          <h2 id="drawer-title" className="erp-drawer__title">
            {title}
          </h2>
          <button
            className="erp-drawer__close"
            onClick={handleClose}
            aria-label="Close drawer"
          >
            <X className="erp-modal__close-icon" />
          </button>
        </div>
        <div className="erp-drawer__body">{children}</div>
        {footer && <div className="erp-drawer__footer">{footer}</div>}
      </div>
    </>
  );
}
