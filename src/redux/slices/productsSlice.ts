/* ============================================================
 * Redux Slice — Products
 * ============================================================
 * Manages product inventory with CRUD operations.
 * ============================================================ */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "@/types/product";
import { MOCK_PRODUCTS } from "@/mock/products";

interface ProductsSliceState {
  items: Product[];
  initialized: boolean;
}

const initialState: ProductsSliceState = {
  items: [],
  initialized: false,
};

export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    initProducts(state) {
      if (!state.initialized) {
        state.items = [...MOCK_PRODUCTS];
        state.initialized = true;
      }
    },
    addProduct(state, action: PayloadAction<Product>) {
      state.items.unshift(action.payload);
    },
    updateProduct(state, action: PayloadAction<Product>) {
      const index = state.items.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteProduct(state, action: PayloadAction<string>) {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },
  },
});

export const { initProducts, addProduct, updateProduct, deleteProduct } =
  productsSlice.actions;

/** Selectors */
export const selectProducts = (state: { products: ProductsSliceState }) =>
  state.products.items;
export const selectProductsInitialized = (state: { products: ProductsSliceState }) =>
  state.products.initialized;
