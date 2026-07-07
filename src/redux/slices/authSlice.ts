/* ============================================================
 * Redux Slice — Auth
 * ============================================================
 * Manages authentication state and role switching.
 * ============================================================ */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser, Role } from "@/types/auth";
import { MOCK_AUTH_USERS } from "@/mock/users";

interface AuthSliceState {
  user: AuthUser | null;
  isAuthenticated: boolean;
}

const initialState: AuthSliceState = {
  user: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
    switchRole(state, action: PayloadAction<Role>) {
      const mockUser = MOCK_AUTH_USERS[action.payload];
      if (mockUser) {
        state.user = mockUser;
        state.isAuthenticated = true;
      }
    },
  },
});

export const { login, logout, switchRole } = authSlice.actions;
