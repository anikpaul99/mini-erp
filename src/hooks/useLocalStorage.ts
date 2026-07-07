/* ============================================================
 * Hook — useLocalStorage
 * ============================================================
 * Persisted state backed by localStorage.
 *
 * @example
 * const [theme, setTheme] = useLocalStorage("theme", "dark");
 * ============================================================ */

import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`[useLocalStorage] Error reading "${key}":`, error);
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const newValue = value instanceof Function ? value(prev) : value;
          window.localStorage.setItem(key, JSON.stringify(newValue));
          return newValue;
        });
      } catch (error) {
        console.warn(`[useLocalStorage] Error setting "${key}":`, error);
      }
    },
    [key],
  );

  return [storedValue, setValue];
}
