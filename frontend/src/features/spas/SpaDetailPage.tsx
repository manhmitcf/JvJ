import { type ReactNode, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, Clock3, Mail, MapPin, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { StitchButtonLink, StitchContainer, StitchEyebrow } from "@/features/public/components/StitchPublicPrimitives";
import { SpaGallery } from "@/features/spas/components/SpaGallery";
import { getSpaGalleryImages, getSpaMapImage } from "@/features/spas/components/spa-assets";
import { useSpaStore } from "@/features/spas/stores/spa-store";

export function SpaDetailPage() {
  const { spaId = "" } = useParams();
  const { spas, selectedSpa, isLoading, error, loadSpaById } = useSpaStore();

  useEffect(() => {
    void loadSpaById(spaId);
  }, [loadSpaById, spaId]);

  const spaIndex = useMemo(() => {
    const index = spas.findIndex((spa) => spa.id === selectedSpa?.id);
    return index >= 0 ? index : 0;
  }, [selectedSpa?.id, spas]);

  if (isLoading) {
    return (
      <StitchContainer className="py-2xl pb-section-gap">
        <LoadingSkeleton variant="card" count={1} />
      </StitchContainer>
    );
  }

  if (error || !selectedSpa) {
    return (
      <StitchContainer className="py-2xl pb-section-gap">
        <EmptyState
          title="Không tìm thấy spa"
          description="Spa này đang tạm ẩn hoặc chưa sẵn sàng hiển thị công khai. Anh Mạnh quay lại danh sách để chọn cơ sở đang hoạt động nhé."
          action={<Link to="/spas" className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-on-primary">Quay lại danh sách spa</Link>}
        />
      </StitchContainer>
    );
  }

  const galleryImages = getSpaGalleryImages(spaIndex);
  const mapImage = getSpaMapImage();

  return (
    <StitchContainer className="py-2xl pb-section-gap">
      <div className="mb-xl flex flex-wrap items-center gap-sm text-body-sm text-sage-secondary">
        <Link to="/spas" className="font-semibold text-primary hover:underline">Danh sách spa</Link>
        <span>/</span>
        <span>{selectedSpa.name}</span>
      </div>

      <section className="grid gap-2xl lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="space-y-lg">
          <StitchEyebrow>Spa đối tác JvJ tại {selectedSpa.district}</StitchEyebrow>
          <div className="space-y-md">
            <h1 className="text-display-mobile font-bold text-ink-primary md:text-display">{selectedSpa.name}</h1>
            <p className="max-w-3xl text-body-lg text-sage-secondary">{selectedSpa.description}</p>
          </div>
          <div className="flex flex-wrap gap-sm">
            <InfoPill icon={<MapPin className="h-4 w-4" />} text={selectedSpa.district} />
            <InfoPill icon={<Clock3 className="h-4 w-4" />} text={`${selectedSpa.openTime} - ${selectedSpa.closeTime}`} />
            <InfoPill icon={<Sparkles className="h-4 w-4" />} text="Không gian được chọn lọc từ asset thiết kế" accent />
            <InfoPill icon={<ShieldCheck className="h-4 w-4" />} text={selectedSpa.status === "active" ? "Đang hoạt động" : "Tạm ẩn"} success={selectedSpa.status === "active"} />
          </div>
          <div className="flex flex-wrap gap-md">
            <StitchButtonLink to={`/app/bookings/new?spaId=${selectedSpa.id}`}>Đặt lịch ngay</StitchButtonLink>
            <StitchButtonLink to="/spas" variant="secondary">Xem spa khác</StitchButtonLink>
          </div>
        </div>

        <aside className="rounded-xl border border-botanical-border bg-surface-container-lowest p-xl shadow-stitch-soft">
          <h2 className="text-h3 font-h3 text-ink-primary">Thông tin liên hệ</h2>
          <div className="mt-lg space-y-md text-body text-sage-secondary">
            <DetailRow icon={<MapPin className="h-5 w-5 text-primary" />} label="Địa chỉ" value={selectedSpa.address} />
            <DetailRow icon={<Phone className="h-5 w-5 text-primary" />} label="Điện thoại" value={selectedSpa.phone} />
            <DetailRow icon={<Mail className="h-5 w-5 text-primary" />} label="Email" value={selectedSpa.email} />
            <DetailRow icon={<Clock3 className="h-5 w-5 text-primary" />} label="Giờ mở cửa" value={`${selectedSpa.openTime} - ${selectedSpa.closeTime}`} />
          </div>
          <div className="mt-xl rounded-xl border border-secondary-container bg-gentle-wash p-lg text-body-sm text-on-secondary-container">
            Spa hiện có <span className="font-bold">{selectedSpa.linkedTreatmentCount} liệu trình</span> liên kết với hệ sinh thái JvJ để hỗ trợ đặt lịch thuận tiện hơn.
          </div>
        </aside>
      </section>

      <section className="mt-2xl">
        <SpaGallery images={galleryImages} spaName={selectedSpa.name} />
      </section>

      <section className="mt-2xl grid gap-xl lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-xl border border-botanical-border bg-surface-container-lowest p-xl shadow-stitch-soft">
          <h2 className="text-h2 font-h2 text-ink-primary">Điểm nổi bật của cơ sở</h2>
          <div className="mt-lg grid gap-md text-body text-sage-secondary md:grid-cols-2">
            <FeatureCard title="Không gian thư giãn" description="Ưu tiên cảm giác sạch, thoáng và dễ thở, phù hợp tinh thần modern wellness của JvJ." />
            <FeatureCard title="Thông tin minh bạch" description="Giờ mở cửa, liên hệ và khu vực hỗ trợ được hiển thị rõ để khách dễ quyết định." />
            <FeatureCard title="Phù hợp nhu cầu địa phương" description="Định hướng phục vụ khách hàng tại Đà Nẵng, đặc biệt khu vực trung tâm và ven biển." />
            <FeatureCard title="Kết nối nhanh với đặt lịch" description="Từ trang spa có thể chuyển thẳng sang flow booking để không phải đi vòng nhiều bước." />
          </div>
        </article>

        <article className="overflow-hidden rounded-xl border border-botanical-border bg-surface-container-lowest shadow-stitch-soft">
          <img src={mapImage} alt="Bản đồ minh họa khu vực Đà Nẵng và Sơn Trà" loading="lazy" className="h-[280px] w-full object-cover" />
          <div className="p-xl">
            <h2 className="text-h3 font-h3 text-ink-primary">Vị trí minh họa khu vực</h2>
            <p className="mt-sm text-body text-sage-secondary">
              Ảnh bản đồ minh họa giúp Anh Mạnh hình dung nhanh khu vực phục vụ quanh Đà Nẵng và Sơn Trà. Runtime chỉ dùng asset local, không kéo URL từ xa cho đỡ mệt cả app lẫn người nhìn.
            </p>
            <div className="mt-lg flex flex-wrap gap-md">
              <StitchButtonLink to={`/app/bookings/new?spaId=${selectedSpa.id}`}>Chọn lịch hẹn phù hợp</StitchButtonLink>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-2xl rounded-xl border border-botanical-border bg-surface-container-lowest p-xl shadow-stitch-soft">
        <div className="flex flex-col gap-lg md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-h3 font-h3 text-ink-primary">Muốn đặt lịch với spa này?</h2>
            <p className="mt-sm text-body text-sage-secondary">Chuyển sang flow booking của JvJ để chọn dịch vụ, khung giờ và thông tin liên hệ phù hợp.</p>
          </div>
          <div className="flex flex-wrap gap-md">
            <StitchButtonLink to={`/app/bookings/new?spaId=${selectedSpa.id}`}>Đặt lịch ngay</StitchButtonLink>
          </div>
        </div>
      </section>
    </StitchContainer>
  );
}

function InfoPill({ icon, text, accent = false, success = false }: { icon: ReactNode; text: string; accent?: boolean; success?: boolean }) {
  const classes = success
    ? "border-green-200 bg-green-50 text-green-700"
    : accent
      ? "border-secondary-container bg-gentle-wash text-on-secondary-container"
      : "border-botanical-border bg-surface text-sage-secondary";

  return <div className={`inline-flex items-center gap-sm rounded-full border px-md py-sm text-body-sm font-medium ${classes}`}>{icon}<span>{text}</span></div>;
}

function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-md">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-label-caption font-bold uppercase tracking-[0.16em] text-sage-secondary">{label}</p>
        <p className="mt-xs text-body font-medium text-ink-primary">{value}</p>
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-botanical-border bg-surface p-lg">
      <h3 className="text-base font-semibold text-ink-primary">{title}</h3>
      <p className="mt-sm text-body-sm text-sage-secondary">{description}</p>
    </div>
  );
}
