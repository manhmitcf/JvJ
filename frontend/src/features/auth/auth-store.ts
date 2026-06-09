import { create } from "zustand";
import { type Therapist } from "@/types/therapist";
import { type User, type UserRole } from "@/types/user";

export type AuthUser = User | Therapist;

type AuthState = {
  user: AuthUser | null;
  isInitialized: boolean;
  setUser: (user: AuthUser | null) => void;
  setInitialized: (value: boolean) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialized: false,
  setUser: (user) => set({ user }),
  setInitialized: (value) => set({ isInitialized: value }),
  logout: () => set({ user: null, isInitialized: true }),
}));

export function getCurrentRole(user: AuthUser | null): UserRole {
  return user?.role ?? "guest";
}
