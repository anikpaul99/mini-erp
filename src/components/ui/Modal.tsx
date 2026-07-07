/* ============================================================
 * UI — Modal
 * ============================================================
 * Design Bible §4.10. Centered overlay with focus trap.
 * ============================================================ */

import { useEffect, useRef, useCallback, useState, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Use "wide" for 560px (forms with image upload) */
  size?: "default" | "wide";
  /** Center body content (used for sale success) */
  centered?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  size = "default",
  centered = false,
  children,
  footer,
}: ModalProps) {
  const [closing, setClosing] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 220);
  }, [onClose]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, handleClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    const focusable = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) focusable[0].focus();
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen && !closing) return null;

  const sizeClass = size === "wide" ? " erp-modal--wide" : "";
  const centeredClass = centered ? " erp-modal--centered-content" : "";

  return (
    <div
      ref={overlayRef}
      className={`erp-modal-overlay${closing ? " erp-modal-overlay--closing" : ""}`}
      onClick={(e) => {
        if (e.target === overlayRef.current) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`erp-modal${sizeClass}${centeredClass}${closing ? " erp-modal--closing" : ""}`}
      >
        <div className="erp-modal__header">
          <h2 id="modal-title" className="erp-modal__title">
            {title}
          </h2>
          <button
            className="erp-modal__close"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <X className="erp-modal__close-icon" />
          </button>
        </div>
        <div className={`erp-modal__body${centered ? "" : " erp-modal__body--form"}`}>
          {children}
        </div>
        {footer && <div className="erp-modal__footer">{footer}</div>}
      </div>
    </div>
  );
}
