/* ============================================================
 * Redux Slice — System Users
 * ============================================================
 * Manages user accounts (Admin-only) with add/edit/toggle.
 * ============================================================ */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SystemUser } from "@/types/user";
import { MOCK_USERS } from "@/mock/users";

interface UsersSliceState {
  items: SystemUser[];
  initialized: boolean;
}

const initialState: UsersSliceState = {
  items: [],
  initialized: false,
};

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    initUsers(state) {
      if (!state.initialized) {
        state.items = [...MOCK_USERS];
        state.initialized = true;
      }
    },
    addUser(state, action: PayloadAction<SystemUser>) {
      state.items.unshift(action.payload);
    },
    updateUser(state, action: PayloadAction<SystemUser>) {
      const index = state.items.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    toggleUserStatus(state, action: PayloadAction<string>) {
      const user = state.items.find((u) => u.id === action.payload);
      if (user) {
        user.status = user.status === "Active" ? "Inactive" : "Active";
      }
    },
  },
});

export const { initUsers, addUser, updateUser, toggleUserStatus } =
  usersSlice.actions;

export const selectUsers = (state: { users: UsersSliceState }) =>
  state.users.items;
export const selectUsersInitialized = (state: { users: UsersSliceState }) =>
  state.users.initialized;
