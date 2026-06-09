import { useState } from "react";
import { CalendarDays, MapPin, Menu, Search, UserCircle, X } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useAuthStore } from "@/features/auth/auth-store";

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const authUser = useAuthStore((state) => state.user);

  const navLinks = [
    { label: "Trang chủ", to: "/" },
    { label: "Liệu trình", to: "/treatments" },
    ...(authUser ? [{ label: "Lịch hẹn", to: "/app/appointments" }] : []),
  ];

  const authLink = authUser
    ? {
        label: authUser.fullName || "Tài khoản",
        to: authUser.role === "customer" ? "/app/calendar" : authUser.role === "therapist" ? "/therapist" : "/admin"
      }
    : { label: "Đăng nhập", to: "/login" };

  return (
    <div className="min-h-screen bg-warm-bg font-sans text-ink-primary">
      <header className="sticky top-0 z-50 border-b border-botanical-border bg-surface/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-max-width items-center justify-between gap-6 px-6 md:px-8 lg:px-10">
          <Link to="/" className="flex items-center gap-3">
            <BrandLogo subtitle="Chăm sóc tại nhà" />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-sage-secondary lg:flex">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="transition-colors hover:text-primary">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 xl:flex">
            <div className="inline-flex h-11 items-center gap-2 rounded-full border border-botanical-border bg-surface-container-lowest px-4 text-sm font-medium text-sage-secondary">
              <MapPin className="h-4 w-4 text-primary" />
              Đà Nẵng
            </div>
            <Link to="/treatments" className="inline-flex h-11 items-center gap-2 rounded-full border border-botanical-border bg-surface-container-lowest px-4 text-sm font-semibold text-ink-primary transition-colors hover:border-primary/40 hover:text-primary">
              <Search className="h-4 w-4" />
              Tìm dịch vụ
            </Link>
            <Link to={authLink.to} className="inline-flex h-11 max-w-[200px] items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover">
              <UserCircle className="h-4 w-4 shrink-0" />
              <span className="truncate">{authLink.label}</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-botanical-border bg-surface-container-lowest text-ink-primary lg:hidden"
            aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-botanical-border bg-surface-container-lowest px-6 py-5 shadow-stitch-soft lg:hidden">
            <nav className="flex flex-col gap-4 text-sm font-semibold text-sage-secondary">
              {navLinks.map((link) => (
                <Link key={link.label} to={link.to} onClick={() => setMobileMenuOpen(false)} className="transition-colors hover:text-primary">
                  {link.label}
                </Link>
              ))}
              <Link to="/treatments" onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center gap-2 text-ink-primary transition-colors hover:text-primary">
                <Search className="h-4 w-4" />
                Tìm dịch vụ
              </Link>
              <Link to={authLink.to} onClick={() => setMobileMenuOpen(false)} className="inline-flex w-fit max-w-[250px] items-center gap-2 rounded-full bg-primary px-5 py-3 text-primary-foreground transition-colors hover:bg-primary-hover">
                <UserCircle className="h-4 w-4 shrink-0" />
                <span className="truncate">{authLink.label}</span>
              </Link>
            </nav>
          </div>
        ) : null}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-botanical-border bg-ink-primary text-white">
        <div className="mx-auto grid max-w-max-width gap-8 px-6 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr] md:px-8 lg:px-10">
          <div>
            <BrandLogo imageClassName="h-12 w-12" textClassName="text-2xl font-black text-white" />
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">Nền tảng đặt lịch massage trị liệu và vật lý trị liệu tại nhà trong phạm vi Đà Nẵng.</p>
          </div>
          <div>
            <h3 className="font-bold">Khám phá</h3>
            <div className="mt-4 space-y-3 text-sm text-white/70">
              <Link to="/treatments" className="block hover:text-white">Liệu trình</Link>
              <Link to="/login" className="block hover:text-white">Đăng nhập</Link>
            </div>
          </div>
          <div>
            <h3 className="font-bold">Dịch vụ</h3>
            <div className="mt-4 space-y-3 text-sm text-white/70">
              <p>Massage trị liệu</p>
              <p>Vật lý trị liệu</p>
              <p>Phục hồi vận động</p>
            </div>
          </div>
          <div>
            <h3 className="font-bold">Khu vực phục vụ</h3>
            <p className="mt-4 text-sm leading-6 text-white/70">Hải Châu, Sơn Trà, Thanh Khê, Ngũ Hành Sơn và các khu vực nội thành Đà Nẵng.</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
              <CalendarDays className="h-4 w-4" />
              Đặt lịch minh bạch
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
