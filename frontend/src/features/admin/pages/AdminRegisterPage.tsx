import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { registerAdmin } from "@/features/auth/auth-service";
import { useAuthStore } from "@/features/auth/auth-store";

export function AdminRegisterPage() {
  const navigate = useNavigate();
  const { setUser, setInitialized } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    otp: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.email || !formData.password || !formData.fullName || !formData.otp) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (formData.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await registerAdmin({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        otp: formData.otp,
      });

      // Update auth store
      setUser(response.user);
      setInitialized(true);

      // Redirect to admin dashboard
      navigate("/admin");
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || err?.message || "Đăng ký thất bại";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-soft-mint via-white to-warm-bg px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-ink-primary">Đăng ký Admin</h1>
          <p className="mt-2 text-body-sm font-medium text-sage-secondary">
            Tạo tài khoản quản trị viên duy nhất
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-lg rounded-[2rem] border border-botanical-border bg-white p-xl shadow-stitch-soft">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-md text-body-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-xs block text-body-sm font-black text-ink-primary">
              Họ và tên
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body font-medium text-ink-primary placeholder:text-muted-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Nhập họ tên đầy đủ"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="mb-xs block text-body-sm font-black text-ink-primary">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body font-medium text-ink-primary placeholder:text-muted-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="admin@jvj.com"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="mb-xs block text-body-sm font-black text-ink-primary">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm pr-12 text-body font-medium text-ink-primary placeholder:text-muted-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Tối thiểu 8 ký tự"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-md top-1/2 -translate-y-1/2 text-sage-secondary hover:text-primary"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-xs block text-body-sm font-black text-ink-primary">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm pr-12 text-body font-medium text-ink-primary placeholder:text-muted-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Nhập lại mật khẩu"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-md top-1/2 -translate-y-1/2 text-sage-secondary hover:text-primary"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-xs block text-body-sm font-black text-ink-primary">
              OTP bảo mật
            </label>
            <input
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              className="w-full rounded-2xl border border-botanical-border bg-warm-bg px-md py-sm text-body font-medium text-ink-primary placeholder:text-muted-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Nhập mã OTP từ admin"
              disabled={isSubmitting}
            />
            <p className="mt-xs text-label-caption font-medium text-muted-text">
              Liên hệ quản trị hệ thống để lấy mã OTP
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-primary px-lg py-md font-black text-white shadow-stitch-soft transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Đang đăng ký..." : "Đăng ký Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
