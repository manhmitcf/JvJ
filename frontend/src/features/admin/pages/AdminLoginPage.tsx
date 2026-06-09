import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { loginAsAdmin } from "@/features/auth/auth-service";
import { useAuthStore } from "@/features/auth/auth-store";

export function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const authResponse = await loginAsAdmin(email, password);
      setUser(authResponse.user);
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <BrandLogo
            imageClassName="size-16 rounded-xl"
            textClassName="text-3xl font-extrabold tracking-tighter text-primary"
          />
        </div>

        <div className="rounded-2xl border border-outline-variant/30 bg-white p-8 shadow-lg">
          <h1 className="mb-6 text-center text-2xl font-bold text-on-surface">
            Đăng nhập Admin
          </h1>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label htmlFor="admin-email" className="block text-sm font-semibold text-on-surface">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jvoj.com"
                className="h-auto w-full rounded-xl border border-outline-variant/70 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label htmlFor="admin-password" className="block text-sm font-semibold text-on-surface">
                Mật khẩu
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-auto w-full rounded-xl border border-outline-variant/70 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="h-auto w-full rounded-xl bg-primary py-4 text-base font-bold text-white shadow-md transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập Admin"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-primary hover:underline">
              ← Quay lại trang chủ
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-on-surface-variant">
          © 2026 JvJ Home-Care Therapy Đà Nẵng
        </p>
      </div>
    </div>
  );
}