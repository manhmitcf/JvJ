import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/auth-store";
import { getMe } from "@/features/auth/auth-service";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false, // Không tự động refetch khi focus lại tab
            staleTime: 5 * 60 * 1000, // Data fresh trong 5 phút
            retry: 1, // Chỉ retry 1 lần nếu lỗi
          },
        },
      })
  );
  const setUser = useAuthStore((state) => state.setUser);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  useEffect(() => {
    // Bootstrap auth session nếu có token
    async function bootstrapAuth() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setInitialized(true);
        return;
      }

      try {
        const user = await getMe();
        setUser(user);
      } catch (error) {
        // Token invalid hoặc expired, xóa tokens
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        console.error("Failed to restore session:", error);
      } finally {
        setInitialized(true);
      }
    }

    bootstrapAuth();
  }, [setUser, setInitialized]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
