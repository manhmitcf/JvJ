import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, User, FileBadge, ShieldCheck } from "lucide-react";
import { AdminSecondaryButton } from "./shared";
import { apiClient } from "@/lib/api-client";

type TherapistDetail = {
  id: string;
  user_email: string;
  user_full_name: string;
  user_phone: string;
  user_avatar_url?: string;
  status: string;
  years_of_experience: number;
  specialties: string[];
  service_areas: string[];
  rating: string;
  completed_bookings: number;
  certificate_urls: string[];
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  pending_citizen_id?: string;
  pending_citizen_id_front_url?: string;
  pending_citizen_id_back_url?: string;
  pending_certificate_urls: string[];
  citizen_id?: string;
  citizen_id_front_url?: string;
  citizen_id_back_url?: string;
};

export function AdminTherapistProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<TherapistDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    apiClient
      .get<TherapistDetail>(`/admin/therapists/${id}/`)
      .then((res) => setProfile(res.data))
      .catch((err) => setError((err as Error).message))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return <div className="rounded-[2rem] border border-botanical-border bg-white p-xl text-center text-body-md font-black text-primary shadow-stitch-soft">Đang tải hồ sơ kỹ thuật viên...</div>;
  }

  if (error || !profile) {
    return (
      <div className="space-y-md">
        <div className="rounded-[2rem] border border-red-200 bg-red-50 p-lg text-body-sm font-black text-[#B91C1C]">{error ?? "Không tìm thấy hồ sơ"}</div>
        <AdminSecondaryButton onClick={() => navigate(-1)}>← Quay lại</AdminSecondaryButton>
      </div>
    );
  }

  const hasPendingCccd = Boolean(profile.pending_citizen_id_front_url || profile.pending_citizen_id_back_url);
  const hasPendingCerts = profile.pending_certificate_urls.length > 0;
  const hasApprovedCccd = Boolean(profile.citizen_id_front_url || profile.citizen_id_back_url);
  const hasApprovedCerts = profile.certificate_urls.length > 0;

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex items-center gap-md">
        <AdminSecondaryButton onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /> Quay lại</AdminSecondaryButton>
        <div>
          <p className="text-label-caption font-black uppercase tracking-[0.22em] text-primary">Chi tiết hồ sơ KTV</p>
          <h1 className="text-3xl font-black text-ink-primary md:text-4xl">{profile.user_full_name}</h1>
        </div>
      </div>

      {/* Profile overview */}
      <section className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
        <h2 className="mb-lg inline-flex items-center gap-sm text-xl font-black text-ink-primary"><User className="h-5 w-5 text-primary" /> Thông tin cơ bản</h2>
        <div className="grid gap-lg lg:grid-cols-[160px_minmax(0,1fr)]">
          <div className="flex flex-col items-center gap-xs text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] bg-soft-mint text-primary">
              <User className="h-12 w-12" />
            </div>
            <p className="text-label-caption font-black uppercase text-muted-text">{profile.status}</p>
          </div>
          <div className="grid gap-md md:grid-cols-2">
            <div>
              <label className="mb-xs block text-body-sm font-black text-ink-primary">Họ tên</label>
              <div className="flex h-12 items-center rounded-2xl border border-botanical-border bg-warm-bg px-md text-body-sm font-semibold text-ink-primary">{profile.user_full_name}</div>
            </div>
            <div>
              <label className="mb-xs block text-body-sm font-black text-ink-primary">Email</label>
              <div className="flex h-12 items-center rounded-2xl border border-botanical-border bg-warm-bg px-md text-body-sm font-semibold text-ink-primary">{profile.user_email}</div>
            </div>
            <div>
              <label className="mb-xs block text-body-sm font-black text-ink-primary">Số điện thoại</label>
              <div className="flex h-12 items-center rounded-2xl border border-botanical-border bg-warm-bg px-md text-body-sm font-semibold text-ink-primary">{profile.user_phone || "—"}</div>
            </div>
            <div>
              <label className="mb-xs block text-body-sm font-black text-ink-primary">Kinh nghiệm</label>
              <div className="flex h-12 items-center rounded-2xl border border-botanical-border bg-warm-bg px-md text-body-sm font-semibold text-ink-primary">{profile.years_of_experience} năm</div>
            </div>
            <div className="md:col-span-2">
              <label className="mb-xs block text-body-sm font-black text-ink-primary">Chuyên môn</label>
              <div className="flex flex-wrap gap-xs">
                {profile.specialties.length > 0 ? profile.specialties.map((s) => (
                  <span key={s} className="rounded-full bg-warm-bg px-sm py-1 text-label-caption font-black text-sage-secondary">{s}</span>
                )) : <span className="text-body-sm text-sage-secondary">—</span>}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="mb-xs block text-body-sm font-black text-ink-primary">Khu vực phục vụ</label>
              <div className="flex flex-wrap gap-xs">
                {profile.service_areas.length > 0 ? profile.service_areas.map((a) => (
                  <span key={a} className="rounded-full bg-warm-bg px-sm py-1 text-label-caption font-black text-sage-secondary">{a}</span>
                )) : <span className="text-body-sm text-sage-secondary">—</span>}
              </div>
            </div>
            <div>
              <label className="mb-xs block text-body-sm font-black text-ink-primary">Đánh giá</label>
              <div className="flex h-12 items-center rounded-2xl border border-botanical-border bg-warm-bg px-md text-body-sm font-semibold text-ink-primary">{Number(profile.rating).toFixed(1)} ({profile.completed_bookings} booking)</div>
            </div>
            <div>
              <label className="mb-xs block text-body-sm font-black text-ink-primary">CCCD</label>
              <div className="flex h-12 items-center rounded-2xl border border-botanical-border bg-warm-bg px-md text-body-sm font-semibold text-ink-primary">{profile.citizen_id || "—"}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pending credentials */}
      {(hasPendingCccd || hasPendingCerts) && (
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-lg shadow-stitch-soft">
          <h2 className="mb-lg inline-flex items-center gap-sm text-xl font-black text-amber-600"><ShieldCheck className="h-5 w-5" /> CCCD / Chứng chỉ chờ duyệt</h2>
          {hasPendingCccd && (
            <div className="rounded-[1.5rem] bg-white p-md">
              <p className="text-label-caption font-black uppercase tracking-[0.16em] text-amber-600">CCCD mới</p>
              <div className="mt-sm grid gap-sm sm:grid-cols-2">
                {profile.pending_citizen_id_front_url && (
                  <div>
                    <p className="text-label-caption font-black text-sage-secondary">Mặt trước</p>
                    <img src={profile.pending_citizen_id_front_url} alt="CCCD mặt trước" className="mt-xs max-h-40 w-full rounded-2xl border border-amber-200 object-cover" />
                  </div>
                )}
                {profile.pending_citizen_id_back_url && (
                  <div>
                    <p className="text-label-caption font-black text-sage-secondary">Mặt sau</p>
                    <img src={profile.pending_citizen_id_back_url} alt="CCCD mặt sau" className="mt-xs max-h-40 w-full rounded-2xl border border-amber-200 object-cover" />
                  </div>
                )}
              </div>
            </div>
          )}
          {hasPendingCerts && (
            <div className="mt-sm rounded-[1.5rem] bg-white p-md">
              <p className="text-label-caption font-black uppercase tracking-[0.16em] text-amber-600">Chứng chỉ mới ({profile.pending_certificate_urls.length})</p>
              <div className="mt-sm grid gap-sm md:grid-cols-2">
                {profile.pending_certificate_urls.map((url) => (
                  <div key={url}>
                    <p className="text-label-caption font-black text-sage-secondary">Chứng chỉ</p>
                    <img src={url} alt="Chứng chỉ" className="mt-xs max-h-40 w-full rounded-2xl border border-amber-200 object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Approved credentials */}
      {(hasApprovedCccd || hasApprovedCerts) && (
        <section className="rounded-[2rem] border border-teal-200 bg-teal-50 p-lg shadow-stitch-soft">
          <h2 className="mb-lg inline-flex items-center gap-sm text-xl font-black text-teal-600"><FileBadge className="h-5 w-5" /> Giấy tờ đã duyệt</h2>
          {hasApprovedCccd && (
            <div className="rounded-[1.5rem] bg-white p-md">
              <p className="text-label-caption font-black uppercase tracking-[0.16em] text-teal-600">CCCD</p>
              <div className="mt-sm grid gap-sm sm:grid-cols-2">
                {profile.citizen_id_front_url && (
                  <div>
                    <p className="text-label-caption font-black text-sage-secondary">Mặt trước</p>
                    <img src={profile.citizen_id_front_url} alt="CCCD mặt trước" className="mt-xs max-h-40 w-full rounded-2xl border border-teal-200 object-cover" />
                  </div>
                )}
                {profile.citizen_id_back_url && (
                  <div>
                    <p className="text-label-caption font-black text-sage-secondary">Mặt sau</p>
                    <img src={profile.citizen_id_back_url} alt="CCCD mặt sau" className="mt-xs max-h-40 w-full rounded-2xl border border-teal-200 object-cover" />
                  </div>
                )}
              </div>
            </div>
          )}
          {hasApprovedCerts && (
            <div className="mt-sm rounded-[1.5rem] bg-white p-md">
              <p className="text-label-caption font-black uppercase tracking-[0.16em] text-teal-600">Chứng chỉ ({profile.certificate_urls.length})</p>
              <div className="mt-sm grid gap-sm md:grid-cols-2">
                {profile.certificate_urls.map((url) => (
                  <div key={url}>
                    <p className="text-label-caption font-black text-sage-secondary">Chứng chỉ</p>
                    <img src={url} alt="Chứng chỉ" className="mt-xs max-h-40 w-full rounded-2xl border border-teal-200 object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* No credentials */}
      {!hasPendingCccd && !hasPendingCerts && !hasApprovedCccd && !hasApprovedCerts && (
        <section className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
          <p className="text-body-sm font-semibold text-sage-secondary">Chưa có giấy tờ nào được tải lên.</p>
        </section>
      )}
    </div>
  );
}
