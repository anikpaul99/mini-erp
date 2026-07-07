/* ============================================================
 * Context — Authentication (Redux-backed)
 * ============================================================
 * Thin Context wrapper over the Redux auth slice.
 * Components use useAuth() which reads from Redux store.
 * ============================================================ */

import {
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  login as loginAction,
  logout as logoutAction,
  switchRole as switchRoleAction,
} from "@/redux/slices/authSlice";
import type { AuthUser, Role } from "@/types/auth";
import { MOCK_AUTH_USERS } from "@/mock/users";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const login = useCallback(
    async (email: string, _password: string): Promise<boolean> => {
      await new Promise((r) => setTimeout(r, 500));

      const found = Object.values(MOCK_AUTH_USERS).find(
        (u) => u.email === email
      );
      dispatch(loginAction(found || MOCK_AUTH_USERS.Admin));
      return true;
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch(logoutAction());
  }, [dispatch]);

  const switchRole = useCallback(
    (role: Role) => {
      dispatch(switchRoleAction(role));
    },
    [dispatch]
  );

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, switchRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
