import { Bell, Building2, CalendarDays, ClipboardList, LayoutDashboard, LogOut, MapPin, MessageCircle, Settings, Sparkles, UserCheck, UserRound, Users, Wallet } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useAuthStore } from "@/features/auth/auth-store";
import { cn } from "@/utils/cn";

const areaLabels = {
  Customer: "Customer",
  Therapist: "Therapist",
  Admin: "Admin",
};

const navigation = {
  Customer: [
    { label: "Tìm liệu trình", to: "/treatments", icon: Sparkles },
    { label: "Đặt lịch", to: "/app/bookings/new", icon: ClipboardList },
    { label: "Lịch hẹn", to: "/app/appointments", icon: ClipboardList },
    { label: "Lịch", to: "/app/calendar", icon: CalendarDays },
  ],
  Therapist: [
    { label: "Tổng quan", to: "/therapist", icon: LayoutDashboard },
    { label: "Liệu trình", to: "/therapist/treatments", icon: Sparkles },
    { label: "Lịch làm việc", to: "/therapist/schedule", icon: CalendarDays },
    { label: "Lịch hẹn", to: "/therapist/bookings", icon: ClipboardList },
    { label: "Hồ sơ", to: "/therapist/profile", icon: UserRound },
    { label: "Ví", to: "/therapist/wallet", icon: Wallet },
  ],
  Admin: [
    { label: "Tổng quan", to: "/admin", icon: LayoutDashboard },
    { label: "Người dùng", to: "/admin/users", icon: Users },
    { label: "Duyệt KTV", to: "/admin/therapist-approvals", icon: UserCheck },
    { label: "Booking", to: "/admin/bookings", icon: ClipboardList },
    { label: "Spa đối tác", to: "/admin/spas", icon: Building2 },
  ],
};

const profileLinks = {
  Customer: "/app/profile",
  Therapist: "/therapist/profile",
  Admin: "/admin/users",
};

export function DashboardLayout({ area }: { area: "Customer" | "Therapist" | "Admin" }) {
  const items = navigation[area];
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const displayName = user?.fullName ?? areaLabels[area];
  const roleLabel = user?.role === "therapist" && "status" in user ? `Therapist · ${user.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}` : areaLabels[area];
  const avatarInitial = displayName.trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-warm-bg text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] border-r border-botanical-border bg-white/95 px-lg py-lg shadow-stitch-soft lg:flex lg:flex-col">
        <Link to="/" className="rounded-[2rem] bg-gradient-to-br from-soft-mint via-gentle-wash to-white p-lg shadow-sm transition-transform hover:-translate-y-0.5">
          <BrandLogo imageClassName="h-11 w-11" textClassName="text-xl font-black text-primary" />
          <p className="mt-md whitespace-nowrap text-body-sm font-semibold text-ink-primary">Massage & trị liệu tại nhà</p>
        </Link>

        <nav className="mt-lg space-y-xs">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-sm rounded-2xl px-md py-sm text-body-sm font-bold transition-all",
                    isActive ? "bg-primary text-on-primary shadow-md" : "text-sage-secondary hover:translate-x-0.5 hover:bg-soft-mint hover:text-primary",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[1.75rem] border border-botanical-border bg-white p-md shadow-sm">
          <Link to={profileLinks[area]} className="flex items-center gap-sm rounded-2xl transition-colors hover:bg-soft-mint/50">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-soft-mint text-base font-black text-primary">
              {avatarInitial || <UserRound className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <div className="truncate text-body-sm font-black text-ink-primary">{displayName}</div>
              <div className="truncate text-label-caption font-semibold text-sage-secondary">{roleLabel}</div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="mt-sm flex w-full items-center justify-center gap-xs rounded-2xl border border-red-200 bg-red-50 px-sm py-xs text-body-sm font-black text-[#B91C1C] transition-colors hover:bg-red-100"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="lg:pl-[264px]">
        <header className="border-b border-[#bdc9c6] bg-[#f7faf8] px-lg py-md shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-lg">
            <Link to="/" className="flex items-center lg:hidden">
              <BrandLogo imageClassName="h-10 w-10" textClassName="text-lg font-black text-primary" />
            </Link>
            <div className="ml-auto flex items-center gap-md text-[#181c1c]">
              <button className="relative rounded-full p-2 text-[#181c1c] transition-colors hover:text-primary" aria-label="Thông báo">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-[#f7faf8]" />
              </button>
              <button className="rounded-full p-2 text-[#181c1c] transition-colors hover:text-primary" aria-label="Tin nhắn">
                <MessageCircle className="h-5 w-5" />
              </button>
              <div className="h-9 w-px bg-[#bdc9c6]" />
              <div className="flex items-center gap-xs text-body-sm font-bold text-[#181c1c]">
                <span>Đà Nẵng, VN</span>
                <MapPin className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        </header>

        <main className="px-xl py-lg">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
