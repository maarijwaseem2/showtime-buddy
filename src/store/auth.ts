import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";
import { authApi } from "@/lib/api";

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      hydrate: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const user = await authApi.me();
          set({ user });
        } catch {
          set({ token: null, user: null });
        }
      },
      isAdmin: () => get().user?.role === "ADMIN",
    }),
    { name: "cineslot-auth" }
  )
);
