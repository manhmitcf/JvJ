import { ArrowLeft, BadgeCheck, Info, MapPin, WalletCards } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import loginWellnessTherapyImage from "@/assets/auth/login-wellness-therapy.webp";
import { getSafeLoginRedirect } from "./redirect";
import { loginWithEmail, loginWithGoogle } from "./auth-service";
import { useAuthStore } from "./auth-store";

const trustSignals = [
  {
    icon: BadgeCheck,
    title: "Kỹ thuật viên được thẩm định",
    description: "Quy trình tuyển chọn khắt khe, hồ sơ lý lịch rõ ràng.",
  },
  {
    icon: WalletCards,
    title: "Giá và thời lượng minh bạch",
    description: "Không phí ẩn, cam kết đúng thời gian liệu trình.",
  },
  {
    icon: MapPin,
    title: "Chỉ phục vụ trong phạm vi Đà Nẵng",
    description: "Tập trung chất lượng dịch vụ tốt nhất tại địa phương.",
  },
];

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      // Initialize Google Sign-In
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
          callback: handleGoogleLogin,
          auto_select: false,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            logo_alignment: "left",
            width: "100%",
          }
        );
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  async function handleEmailLogin(event: FormEvent) {
    event.preventDefault();
    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const authResponse = await loginWithEmail(email, password);
      setUser(authResponse.user);
      navigate(getSafeLoginRedirect(redirectParam, authResponse.user));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin(response: { credential?: string }) {
    if (!response.credential) {
      setError("Không nhận được credential từ Google");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const authResponse = await loginWithGoogle(response.credential);
      setUser(authResponse.user);
      navigate(getSafeLoginRedirect(redirectParam, authResponse.user));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-background md:flex-row">
      <section className="relative flex w-full flex-col justify-center overflow-hidden bg-[#E6F4F1] px-8 py-12 md:w-1/2 md:px-16">
        <div className="absolute right-0 top-0 size-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative z-10 mx-auto w-full max-w-xl">
          <Link to="/" className="mb-12 flex w-fit">
            <BrandLogo imageClassName="size-12 rounded-xl shadow-lg shadow-primary/20" textClassName="text-3xl font-extrabold tracking-tighter text-primary" />
          </Link>

          <h1 className="mb-6 text-3xl font-bold leading-tight text-on-background md:text-4xl">
            Đăng nhập để đặt lịch trị liệu tại nhà ở Đà Nẵng
          </h1>
          <p className="mb-10 text-lg leading-relaxed text-on-surface-variant">
            JvJ giúp bạn tiếp tục đặt lịch, quản lý lịch hẹn và kết nối với kỹ thuật viên đã được thẩm định.
          </p>

          <div className="mb-12 space-y-6">
            {trustSignals.map((signal) => {
              const Icon = signal.icon;

              return (
                <div key={signal.title} className="flex items-start gap-4">
                  <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <span className="block font-semibold text-on-surface">{signal.title}</span>
                    <span className="block text-sm text-[#5F6F68]">{signal.description}</span>
                  </span>
                </div>
              );
            })}
          </div>

          <div className="group mt-8 aspect-[16/9] overflow-hidden rounded-2xl border border-white/50 bg-white shadow-xl transition-all duration-500 hover:shadow-2xl">
            <img
              src={loginWellnessTherapyImage}
              alt="Không gian trị liệu tại nhà chuyên nghiệp của JvJ"
              className="size-full object-cover grayscale-[20%] transition-all duration-700 group-hover:grayscale-0"
            />
          </div>
        </div>
      </section>

      <section className="flex w-full items-center justify-center bg-white p-6 md:w-1/2 md:p-12">
        <div className="relative flex w-full max-w-md flex-col items-center overflow-hidden rounded-2xl border border-outline-variant/30 bg-white p-8 text-center shadow-[0_8px_30px_rgb(15,118,110,0.06)] md:p-10">
          <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-primary/10 blur-3xl" />
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-20 left-8 size-52 rounded-full bg-[#E6F4F1] blur-3xl" />
          <span aria-hidden="true" className="pointer-events-none absolute right-10 top-10 size-20 rounded-full border border-primary/10" />
          <span aria-hidden="true" className="pointer-events-none absolute bottom-12 right-12 size-3 rounded-full bg-primary/20" />

          <div className="relative z-10 mb-8">
            <h2 className="mb-2 text-2xl font-bold text-on-surface">Chào mừng trở lại</h2>
            <p className="text-sm text-on-surface-variant">Vui lòng đăng nhập để truy cập tài khoản của bạn</p>
          </div>

          {error && (
            <div className="relative z-10 mb-6 w-full rounded-xl border border-red-200 bg-red-50 p-4 text-left">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="relative z-10 mb-6 w-full space-y-4">
            <div className="space-y-1.5 text-left">
              <label htmlFor="login-email" className="block text-sm font-semibold text-on-surface">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="h-auto w-full rounded-xl border border-outline-variant/70 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <label htmlFor="login-password" className="block text-sm font-semibold text-on-surface">Mật khẩu</label>
              <input
                id="login-password"
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
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="relative z-10 mb-6 w-full">
            <div id="google-signin-button" className="flex justify-center" />
            {isLoading && (
              <p className="mt-2 text-center text-sm text-on-surface-variant">Đang đăng nhập...</p>
            )}
          </div>

          <div className="relative z-10 mb-8 w-full rounded-xl border border-outline-variant/20 bg-surface-container-low/90 p-5 text-left backdrop-blur-sm">
            <div className="flex gap-3">
              <Info className="size-5 shrink-0 text-primary" />
              <p className="text-sm leading-tight text-on-surface-variant">
                Dành cho khách hàng đặt lịch. Kỹ thuật viên có thể đăng ký hồ sơ sau khi đăng nhập.
              </p>
            </div>
          </div>

          <div className="relative z-10 mb-8 flex w-full items-center">
            <span className="h-px flex-1 bg-outline-variant" />
            <span className="px-4 text-xs font-medium uppercase tracking-[0.2em] text-[#8A9992]">Hoặc</span>
            <span className="h-px flex-1 bg-outline-variant" />
          </div>

          <div className="relative z-10 w-full space-y-4">
            <Link className="group block w-full py-2 text-sm font-semibold text-primary transition-colors hover:text-[#115E59]" to="/register">
              Đăng ký trở thành kỹ thuật viên JvJ
              <span className="mx-auto mt-1 block h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link className="flex items-center justify-center gap-1 text-sm text-[#5F6F68] transition-colors hover:text-on-surface" to="/">
              <ArrowLeft className="size-4" />
              Quay lại trang chủ
            </Link>
          </div>

          <p className="relative z-10 mt-10 text-xs text-[#8A9992]">
            © 2026 JvJ Home-Care Therapy Đà Nẵng.
            <br />
            Bảo lưu mọi quyền.
          </p>
        </div>
      </section>
    </div>
  );
}
