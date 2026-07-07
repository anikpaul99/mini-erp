/* ============================================================
 * Redux Slice — Sales
 * ============================================================
 * Manages sales history. New sales are appended by the
 * Create Sale flow.
 * ============================================================ */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Sale } from "@/types/sale";
import { MOCK_SALES } from "@/mock/sales";

interface SalesSliceState {
  items: Sale[];
  initialized: boolean;
}

const initialState: SalesSliceState = {
  items: [],
  initialized: false,
};

export const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    initSales(state) {
      if (!state.initialized) {
        state.items = [...MOCK_SALES];
        state.initialized = true;
      }
    },
    addSale(state, action: PayloadAction<Sale>) {
      state.items.unshift(action.payload);
    },
  },
});

export const { initSales, addSale } = salesSlice.actions;

export const selectSales = (state: { sales: SalesSliceState }) =>
  state.sales.items;
export const selectSalesInitialized = (state: { sales: SalesSliceState }) =>
  state.sales.initialized;
