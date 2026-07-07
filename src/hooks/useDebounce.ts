/* ============================================================
 * Hook — useDebounce
 * ============================================================
 * Debounce any value. Useful for search inputs.
 *
 * @example
 * const debouncedSearch = useDebounce(searchTerm, 300);
 * ============================================================ */

import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
