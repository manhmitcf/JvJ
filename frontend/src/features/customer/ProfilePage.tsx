import { useEffect, useState, useRef } from "react";
import { Camera, CheckCircle2, Mail, Phone, User, ShieldCheck, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useAuthStore } from "@/features/auth/auth-store";
import { uploadAvatar } from "@/features/auth/auth-service";
import { StitchContainer, StitchEyebrow } from "@/features/public/components/StitchPublicPrimitives";
import { getCurrentUser, updateProfile, type UpdateProfileInput } from "./services/profile-service";

interface ProfileFormData {
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
}

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-[1440px] space-y-xl pb-xl">{children}</div>;
}

function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description: string }) {
  return (
    <div className="flex flex-col gap-md rounded-[2rem] border border-botanical-border bg-white/80 p-xl shadow-stitch-soft backdrop-blur">
      <div>
        {eyebrow && <p className="mb-xs text-label-caption font-black uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
        <h1 className="text-3xl font-black tracking-tight text-ink-primary md:text-4xl">{title}</h1>
        <p className="mt-sm max-w-2xl text-body-sm font-medium text-sage-secondary md:text-body">{description}</p>
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
  icon: Icon,
  editable = false,
  onChange,
  onBlur,
  name,
  type = "text",
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  editable?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  type?: string;
}) {
  return (
    <div className="flex items-start gap-md rounded-2xl border border-botanical-border bg-warm-bg p-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-soft-mint text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-label-caption font-black text-muted-text">{label}</p>
        {editable ? (
          <input
            type={type}
            name={name}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onBlur={onBlur}
            className="mt-xs w-full bg-transparent text-body font-semibold text-ink-primary outline-none placeholder:text-muted-text"
            placeholder={`Nhập ${label.toLowerCase()}`}
          />
        ) : (
          <p className="mt-xs text-body font-semibold text-ink-primary">{value || "—"}</p>
        )}
      </div>
    </div>
  );
}

export function ProfilePage() {
  const authUser = useAuthStore((state) => state.user);
  const setAuthUser = useAuthStore((state) => state.setUser);

  const [profile, setProfile] = useState<ProfileFormData | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: "",
    email: "",
    phone: "",
    avatar_url: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load profile from API
  useEffect(() => {
    void loadProfile();
  }, []);

  async function loadProfile() {
    setIsLoading(true);
    setError(null);

    try {
      const user = await getCurrentUser();
      const form: ProfileFormData = {
        full_name: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatarUrl ?? "",
      };
      setProfile(form);
      setFormData(form);

      // Sync with auth store
      setAuthUser(user);
    } catch (err) {
      setError((err as Error).message || "Không thể tải thông tin hồ sơ.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleFieldChange(field: keyof ProfileFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError("Chỉ chấp nhận ảnh JPG, PNG, WebP, GIF");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Ảnh quá lớn (tối đa 5MB)");
      return;
    }

    setAvatarError(null);
    setIsUploadingAvatar(true);

    try {
      const avatarUrl = await uploadAvatar(file);
      setFormData((prev) => ({ ...prev, avatar_url: avatarUrl }));
      setSaveSuccess(false);
    } catch (err) {
      setAvatarError((err as Error).message || "Upload avatar thất bại");
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const input: UpdateProfileInput = {};
      if (formData.full_name !== profile?.full_name) input.full_name = formData.full_name;
      if (formData.phone !== profile?.phone) input.phone = formData.phone;
      if (formData.avatar_url !== profile?.avatar_url) input.avatar_url = formData.avatar_url || undefined;

      if (Object.keys(input).length === 0) {
        setIsEditing(false);
        setIsSaving(false);
        return;
      }

      const updatedUser = await updateProfile(input);
      const newForm: ProfileFormData = {
        full_name: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar_url: updatedUser.avatarUrl ?? "",
      };
      setProfile(newForm);
      setFormData(newForm);
      setAuthUser(updatedUser);
      setIsEditing(false);
      setSaveSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError((err as Error).message || "Không thể lưu thay đổi.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    if (profile) {
      setFormData(profile);
    }
    setIsEditing(false);
    setError(null);
  }

  const hasChanges = profile && (
    formData.full_name !== profile.full_name ||
    formData.phone !== profile.phone ||
    formData.avatar_url !== profile.avatar_url
  );

  if (isLoading) {
    return (
      <StitchContainer className="py-xl">
        <LoadingSkeleton variant="card" count={3} />
      </StitchContainer>
    );
  }

  if (error && !profile) {
    return (
      <StitchContainer className="py-xl">
        <ErrorState message={error} onRetry={() => void loadProfile()} />
      </StitchContainer>
    );
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Customer Account"
        title="Hồ sơ của tôi"
        description="Xem và cập nhật thông tin cá nhân để đặt lịch và nhận dịch vụ chăm sóc sức khỏe tại nhà."
      />

      {/* Profile Completion Banner */}
      <section className="rounded-[2rem] border border-primary/15 bg-soft-mint/70 p-lg shadow-stitch-soft">
        <div className="flex flex-col gap-md lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="mb-sm flex items-center justify-between gap-md">
              <h2 className="inline-flex items-center gap-sm text-xl font-black text-primary">
                <CheckCircle2 className="h-5 w-5" /> Hồ sơ của bạn
              </h2>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-primary" style={{ width: "80%" }} />
            </div>
          </div>
          <div className="flex items-center gap-sm rounded-2xl border border-botanical-border bg-white px-md py-sm text-body-sm font-bold text-ink-primary">
            <ShieldCheck className="h-5 w-5 text-success-leaf" />
            Thông tin được bảo mật
          </div>
        </div>
      </section>

      {error ? (
        <ErrorState message={error} onRetry={() => void loadProfile()} />
      ) : null}

      {/* Success Message */}
      {saveSuccess ? (
        <div className="flex items-center gap-md rounded-2xl border border-success-leaf bg-[#DCFCE7] p-md text-body font-semibold text-success-leaf">
          <CheckCircle2 className="h-5 w-5" />
          Thay đổi đã được lưu thành công!
        </div>
      ) : null}

      {/* Profile Form */}
      <section className="rounded-[2rem] border border-botanical-border bg-white p-xl shadow-stitch-soft">
        <div className="mb-lg flex items-center justify-between">
          <h2 className="inline-flex items-center gap-sm text-xl font-black text-ink-primary">
            <User className="h-5 w-5 text-primary" /> Thông tin cá nhân
          </h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-full bg-soft-mint px-md py-sm text-body-sm font-black text-primary transition hover:bg-primary hover:text-white"
            >
              Chỉnh sửa
            </button>
          ) : (
            <div className="flex gap-sm">
              <button
                onClick={handleCancel}
                className="rounded-full border border-botanical-border bg-surface px-md py-sm text-body-sm font-black text-sage-secondary transition hover:border-primary hover:text-primary"
              >
                Hủy
              </button>
              <button
                onClick={() => void handleSave()}
                disabled={isSaving || !hasChanges}
                className="inline-flex items-center gap-xs rounded-full bg-primary px-md py-sm text-body-sm font-black text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-lg lg:grid-cols-[160px_minmax(0,1fr)]">
          {/* Avatar */}
          <div className="text-center">
            <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-[1.5rem] border-2 border-botanical-border">
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="Ảnh đại diện" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-soft-mint">
                  <User className="h-12 w-12 text-primary" />
                </div>
              )}
              {isEditing && (
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-x-0 bottom-0 flex cursor-pointer items-center justify-center gap-xs bg-black/40 py-xs text-center text-label-caption font-black text-white hover:bg-black/60"
                >
                  {isUploadingAvatar ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Đang tải...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" /> Đổi ảnh
                    </>
                  )}
                </label>
              )}
              <input
                ref={fileInputRef}
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarChange}
                className="sr-only"
              />
            </div>
            {avatarError && (
              <p className="mt-sm text-label-caption font-bold text-red-500">{avatarError}</p>
            )}
            <p className="mt-sm text-label-caption font-bold text-sage-secondary">Ảnh đại diện</p>
          </div>

          {/* Fields */}
          <div className="grid gap-md md:grid-cols-2">
            <ProfileField
              label="Họ và tên"
              value={formData.full_name}
              icon={User}
              editable={isEditing}
              onChange={(val) => handleFieldChange("full_name", val)}
              name="full_name"
            />
            <ProfileField
              label="Email"
              value={formData.email}
              icon={Mail}
              editable={false}
              name="email"
              type="email"
            />
            <ProfileField
              label="Số điện thoại"
              value={formData.phone}
              icon={Phone}
              editable={isEditing}
              onChange={(val) => handleFieldChange("phone", val)}
              name="phone"
              type="tel"
            />
          </div>
        </div>
      </section>

      {/* Info Card */}
      <section className="rounded-[2rem] border border-botanical-border bg-surface-container-low p-lg shadow-stitch-soft">
        <div className="flex items-start gap-md">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-soft-mint text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-black text-ink-primary">Bảo mật thông tin</h3>
            <p className="mt-xs text-body-sm font-medium text-sage-secondary">
              Thông tin cá nhân của bạn được bảo vệ và chỉ dùng để xác thực khi đặt lịch dịch vụ chăm sóc sức khỏe tại nhà qua JvJ.
              Email không thể thay đổi vì được liên kết với tài khoản đăng nhập.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}