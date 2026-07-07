/* ============================================================
 * Common — Confirm Dialog
 * ============================================================
 * Design Bible §4.15. Standard delete/deactivate pattern.
 * ============================================================ */

import { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  body: string;
  confirmLabel?: string;
  /** "danger" for delete, "neutral" for deactivate */
  variant?: "danger" | "neutral";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel = "Delete",
  variant = "danger",
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  const Icon = variant === "danger" ? Trash2 : AlertTriangle;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      centered
      footer={
        <>
          <button
            className="erp-btn erp-btn--md erp-btn--outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={`erp-btn erp-btn--md ${
              variant === "danger"
                ? "erp-btn--destructive"
                : "erp-btn--outline"
            }`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="erp-btn__spinner" />}
            {loading ? "Processing…" : confirmLabel}
          </button>
        </>
      }
    >
      <div
        className={`erp-modal__confirm-icon erp-modal__confirm-icon--${variant}`}
      >
        <Icon />
      </div>
      <h3 className="erp-modal__confirm-title">{title}</h3>
      <p className="erp-modal__confirm-body">{body}</p>
    </Modal>
  );
}
