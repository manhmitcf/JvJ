import { create } from "zustand";
import { type AdminUserRow } from "@/types/admin";
import { getAdminUsers, toggleAdminUserStatus, type AdminUserFilters } from "../services/admin-user-service";

type AdminUserStore = {
  users: AdminUserRow[];
  selectedUser: AdminUserRow | null;
  isLoading: boolean;
  error: string | null;
  fetchUsers: (filters?: AdminUserFilters) => Promise<void>;
  selectUser: (userId: string) => void;
  toggleUserStatus: (userId: string) => Promise<void>;
};

export const useAdminUserStore = create<AdminUserStore>((set) => ({
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,

  fetchUsers: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const users = await getAdminUsers(filters);
      set((state) => ({
        users,
        selectedUser: users.find((user) => user.id === state.selectedUser?.id) ?? users[0] ?? null,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  selectUser: (userId) => {
    set((state) => ({ selectedUser: state.users.find((user) => user.id === userId) ?? null }));
  },

  toggleUserStatus: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const user = await toggleAdminUserStatus(userId);
      set((state) => ({
        users: state.users.map((item) => (item.id === userId ? user : item)),
        selectedUser: state.selectedUser?.id === userId ? user : state.selectedUser,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
