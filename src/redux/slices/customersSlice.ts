/* ============================================================
 * Redux Slice — Customers
 * ============================================================
 * Manages customer records with CRUD operations.
 * ============================================================ */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Customer } from "@/types/customer";
import { MOCK_CUSTOMERS } from "@/mock/customers";

interface CustomersSliceState {
  items: Customer[];
  initialized: boolean;
}

const initialState: CustomersSliceState = {
  items: [],
  initialized: false,
};

export const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    initCustomers(state) {
      if (!state.initialized) {
        state.items = [...MOCK_CUSTOMERS];
        state.initialized = true;
      }
    },
    addCustomer(state, action: PayloadAction<Customer>) {
      state.items.unshift(action.payload);
    },
    updateCustomer(state, action: PayloadAction<Customer>) {
      const index = state.items.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteCustomer(state, action: PayloadAction<string>) {
      state.items = state.items.filter((c) => c.id !== action.payload);
    },
  },
});

export const { initCustomers, addCustomer, updateCustomer, deleteCustomer } =
  customersSlice.actions;

export const selectCustomers = (state: { customers: CustomersSliceState }) =>
  state.customers.items;
export const selectCustomersInitialized = (state: { customers: CustomersSliceState }) =>
  state.customers.initialized;
