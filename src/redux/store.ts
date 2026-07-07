/* ============================================================
 * Redux — Store Configuration
 * ============================================================
 * Central Redux store using Redux Toolkit.
 * Combines all feature slices into a single store.
 * ============================================================ */

import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import { authSlice } from "./slices/authSlice";
import { productsSlice } from "./slices/productsSlice";
import { salesSlice } from "./slices/salesSlice";
import { customersSlice } from "./slices/customersSlice";
import { usersSlice } from "./slices/usersSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    products: productsSlice.reducer,
    sales: salesSlice.reducer,
    customers: customersSlice.reducer,
    users: usersSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/** Typed hooks — use these instead of plain useDispatch/useSelector */
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
