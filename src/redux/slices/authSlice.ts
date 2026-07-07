/* ============================================================
 * Redux Slice — Auth
 * ============================================================
 * Manages authentication state and persisted login sessions.
 * ============================================================ */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthSession, AuthUser } from "@/types/auth";

interface AuthSliceState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

const AUTH_STORAGE_KEY = "mini_erp_auth";
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

function loadStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  try {
    const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawSession) return null;

    const session = JSON.parse(rawSession) as AuthSession;

    if (
      session.user?.id?.startsWith("usr-") ||
      session.accessToken === "dev-admin-token" ||
      session.refreshToken === "dev-admin-refresh-token"
    ) {
      clearStoredSession();
      return null;
    }

    return session;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    return null;
  }
}

function saveStoredSession(session: AuthSession) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  window.localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
}

function clearStoredSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

const storedSession = loadStoredSession();

const initialState: AuthSliceState = {
  user: storedSession?.user ?? null,
  accessToken: storedSession?.accessToken ?? null,
  refreshToken: storedSession?.refreshToken ?? null,
  isAuthenticated: Boolean(storedSession?.accessToken && storedSession?.user),
};

const emptyState: AuthSliceState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<AuthSession>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      saveStoredSession(action.payload);
    },
    logout(state) {
      Object.assign(state, emptyState);
      clearStoredSession();
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
