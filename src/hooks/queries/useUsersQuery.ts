/* ============================================================
 * React Query Hooks — Users
 * ============================================================ */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  initUsers,
  addUser,
  updateUser,
  toggleUserStatus,
  selectUsers,
  selectUsersInitialized,
} from "@/redux/slices/usersSlice";
import type { SystemUser } from "@/types/user";
import { simulateDelay, generateId } from "@/mock/helpers";

const USERS_KEY = ["users"] as const;

export function useUsers() {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const initialized = useAppSelector(selectUsersInitialized);

  return useQuery({
    queryKey: USERS_KEY,
    queryFn: async () => {
      if (!initialized) {
        await simulateDelay();
        dispatch(initUsers());
      }
      return users;
    },
    initialData: initialized ? users : undefined,
  });
}

export function useAddUser() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<SystemUser>) => {
      await simulateDelay();
      const user: SystemUser = {
        id: generateId(),
        name: data.name || "",
        email: data.email || "",
        role: data.role || "Employee",
        status: "Active",
        dateJoined: new Date().toISOString(),
      };
      dispatch(addUser(user));
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}

export function useUpdateUser() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: SystemUser) => {
      await simulateDelay();
      dispatch(updateUser(user));
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}

export function useToggleUserStatus() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await simulateDelay();
      dispatch(toggleUserStatus(userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}
