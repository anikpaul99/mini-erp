/* ============================================================
 * React Query Hooks — Products
 * ============================================================
 * Custom hooks wrapping mock data fetching with
 * tanstack/react-query for caching, loading, and error states.
 * ============================================================ */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  initProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  selectProducts,
  selectProductsInitialized,
} from "@/redux/slices/productsSlice";
import type { Product } from "@/types/product";
import { simulateDelay, generateId } from "@/mock/helpers";

const PRODUCTS_KEY = ["products"] as const;

/**
 * Fetch all products — initializes Redux store on first call,
 * then reads from Redux for subsequent renders.
 */
export function useProducts() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);
  const initialized = useAppSelector(selectProductsInitialized);

  return useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: async () => {
      if (!initialized) {
        await simulateDelay();
        dispatch(initProducts());
      }
      return products;
    },
    initialData: initialized ? products : undefined,
    enabled: true,
  });
}

/**
 * Add a new product.
 */
export function useAddProduct() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Product>) => {
      await simulateDelay();
      const newProduct: Product = {
        id: generateId(),
        name: data.name || "",
        sku: data.sku || "",
        category: data.category!,
        purchasePrice: data.purchasePrice || 0,
        sellingPrice: data.sellingPrice || 0,
        stock: data.stock || 0,
        image: data.image,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch(addProduct(newProduct));
      return newProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
}

/**
 * Update an existing product.
 */
export function useUpdateProduct() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Product) => {
      await simulateDelay();
      const updated = { ...product, updatedAt: new Date().toISOString() };
      dispatch(updateProduct(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
}

/**
 * Delete a product by ID.
 */
export function useDeleteProduct() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      await simulateDelay();
      dispatch(deleteProduct(productId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
}
