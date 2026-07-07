/* ============================================================
 * React Query Hooks — Customers
 * ============================================================ */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  initCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  selectCustomers,
  selectCustomersInitialized,
} from "@/redux/slices/customersSlice";
import type { Customer } from "@/types/customer";
import { simulateDelay, generateId } from "@/mock/helpers";

const CUSTOMERS_KEY = ["customers"] as const;

export function useCustomers() {
  const dispatch = useAppDispatch();
  const customers = useAppSelector(selectCustomers);
  const initialized = useAppSelector(selectCustomersInitialized);

  return useQuery({
    queryKey: CUSTOMERS_KEY,
    queryFn: async () => {
      if (!initialized) {
        await simulateDelay();
        dispatch(initCustomers());
      }
      return customers;
    },
    initialData: initialized ? customers : undefined,
  });
}

export function useAddCustomer() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Customer>) => {
      await simulateDelay();
      const customer: Customer = {
        id: generateId(),
        name: data.name || "",
        phone: data.phone || "",
        email: data.email,
        notes: data.notes,
        totalPurchases: 0,
        createdAt: new Date().toISOString(),
      };
      dispatch(addCustomer(customer));
      return customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY });
    },
  });
}

export function useUpdateCustomer() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customer: Customer) => {
      await simulateDelay();
      dispatch(updateCustomer(customer));
      return customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY });
    },
  });
}

export function useDeleteCustomer() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId: string) => {
      await simulateDelay();
      dispatch(deleteCustomer(customerId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY });
    },
  });
}
