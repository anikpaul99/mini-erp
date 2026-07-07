/* ============================================================
 * Hook — useScrollLock
 * ============================================================
 * Lock/unlock body scroll. Used by Modal and drawers.
 *
 * @example
 * useScrollLock(isModalOpen);
 * ============================================================ */

import { useEffect } from "react";

export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (locked) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [locked]);
}
