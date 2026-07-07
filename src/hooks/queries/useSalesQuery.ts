/* ============================================================
 * React Query Hooks — Sales
 * ============================================================ */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  initSales,
  addSale,
  selectSales,
  selectSalesInitialized,
} from "@/redux/slices/salesSlice";
import type { Sale, SaleLineItem } from "@/types/sale";
import { simulateDelay, generateId, generateDisplayId } from "@/mock/helpers";

const SALES_KEY = ["sales"] as const;

export function useSales() {
  const dispatch = useAppDispatch();
  const sales = useAppSelector(selectSales);
  const initialized = useAppSelector(selectSalesInitialized);

  return useQuery({
    queryKey: SALES_KEY,
    queryFn: async () => {
      if (!initialized) {
        await simulateDelay();
        dispatch(initSales());
      }
      return sales;
    },
    initialData: initialized ? sales : undefined,
  });
}

export function useCreateSale() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const sales = useAppSelector(selectSales);

  return useMutation({
    mutationFn: async (data: {
      lineItems: SaleLineItem[];
      grandTotal: number;
      customerId?: string;
      customerName?: string;
      createdBy: string;
      createdByName: string;
    }) => {
      await simulateDelay(600);
      const sale: Sale = {
        id: generateId(),
        displayId: generateDisplayId("S", sales.length + 1),
        customerId: data.customerId,
        customerName: data.customerName,
        lineItems: data.lineItems,
        grandTotal: data.grandTotal,
        createdBy: data.createdBy,
        createdByName: data.createdByName,
        createdAt: new Date().toISOString(),
      };
      dispatch(addSale(sale));
      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_KEY });
    },
  });
}
