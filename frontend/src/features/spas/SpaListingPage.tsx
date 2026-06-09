import { type ReactNode, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Building2, CalendarDays, MapPin, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { LoadingState } from "@/components/shared/LoadingState";
import { Input } from "@/components/ui/input";
import { StitchButtonLink, StitchContainer, StitchEyebrow } from "@/features/public/components/StitchPublicPrimitives";
import { SpaCard } from "@/features/spas/components/SpaCard";
import { getSpaCalendarQuoteImage, getSpaListingImage } from "@/features/spas/components/spa-assets";
import { useSpaStore } from "@/features/spas/stores/spa-store";

const districtOptions = ["all", "Sơn Trà", "Hải Châu", "Ngũ Hành Sơn", "Thanh Khê", "Cẩm Lệ", "Liên Chiểu", "Hòa Vang"] as const;

export function SpaListingPage() {
  const { spas, isLoading, error, searchQuery, districtFilter, loadSpas, setSearchQuery, setDistrictFilter } = useSpaStore();
  const footerImage = getSpaCalendarQuoteImage();

  useEffect(() => {
    void loadSpas();
  }, [loadSpas]);

  const filteredSpas = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    return spas.filter((spa) => {
      const matchesKeyword =
        keyword.length === 0 ||
        `${spa.name} ${spa.address} ${spa.district} ${spa.description}`.toLowerCase().includes(keyword);
      const matchesDistrict = districtFilter === "all" || spa.district === districtFilter;
      return matchesKeyword && matchesDistrict;
    });
  }, [districtFilter, searchQuery, spas]);

  const activeSpaCount = spas.length;

  return (
    <StitchContainer className="py-2xl pb-section-gap">
      <section className="grid gap-2xl rounded-[28px] border border-botanical-border bg-gradient-to-br from-surface-container-lowest via-surface to-soft-mint p-2xl shadow-stitch-soft lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-lg">
          <StitchEyebrow>Không gian chăm sóc đối tác JvJ</StitchEyebrow>
          <div className="space-y-md">
            <h1 className="text-display-mobile font-bold text-ink-primary md:text-display">Chọn spa phù hợp để bắt đầu hành trình thư giãn và phục hồi tại Đà Nẵng</h1>
            <p className="max-w-2xl text-body-lg text-sage-secondary">
              JvJ kết nối các spa đối tác có không gian chỉn chu, lịch mở cửa rõ ràng và thuận tiện để Anh Mạnh tham khảo trước khi đặt lịch trị liệu.
            </p>
          </div>
          <div className="flex flex-wrap gap-md">
            <StitchButtonLink to="/app/bookings/new">Đặt lịch với JvJ</StitchButtonLink>
            <StitchButtonLink to="/treatments" variant="secondary">Xem thêm liệu trình</StitchButtonLink>
          </div>
          <div className="grid gap-md sm:grid-cols-3">
            <SummaryTile icon={<Building2 className="h-5 w-5" />} label="Spa đang hoạt động" value={`${activeSpaCount}+`} />
            <SummaryTile icon={<MapPin className="h-5 w-5" />} label="Khu vực hỗ trợ" value="Toàn Đà Nẵng" />
            <SummaryTile icon={<CalendarDays className="h-5 w-5" />} label="Khung giờ tham khảo" value="08:00 - 21:00" />
          </div>
        </div>

        <div className="rounded-[28px] border border-white/70 bg-white/80 p-xl backdrop-blur">
          <div className="mb-lg inline-flex items-center gap-sm rounded-full bg-soft-mint px-md py-sm text-sm font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            Gợi ý theo phong cách wellness đáng tin cậy
          </div>
          <div className="space-y-md text-body text-sage-secondary">
            <p>Ưu tiên spa có mô tả minh bạch, giờ mở cửa rõ ràng và vị trí dễ đi lại cho nhu cầu chăm sóc tại nhà hoặc ghé cơ sở đối tác.</p>
            <p>Ảnh minh họa được dựng từ asset local để đối chiếu đúng visual, không kéo remote và cũng không lấy screenshot làm nền cho xong chuyện.</p>
          </div>
        </div>
      </section>

      <section className="mt-2xl rounded-xl border border-botanical-border bg-surface-container-lowest p-xl shadow-stitch-soft">
        <div className="grid gap-lg lg:grid-cols-[1fr_220px_180px]">
          <label className="block">
            <span className="mb-sm block text-label-caption font-medium text-sage-secondary">Tìm spa hoặc khu vực</span>
            <div className="relative">
              <Search className="absolute left-md top-1/2 h-5 w-5 -translate-y-1/2 text-outline" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-12 rounded-lg border-botanical-border bg-surface pl-3xl pr-lg focus:border-primary focus:ring-primary"
                placeholder="Ví dụ: Sơn Trà, thư giãn, biển Mỹ Khê"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-sm block text-label-caption font-medium text-sage-secondary">Lọc theo quận</span>
            <select
              value={districtFilter}
              onChange={(event) => setDistrictFilter(event.target.value)}
              className="h-12 w-full rounded-lg border border-botanical-border bg-surface px-lg text-body text-ink-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {districtOptions.map((district) => (
                <option key={district} value={district}>
                  {district === "all" ? "Tất cả quận" : district}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setDistrictFilter("all");
            }}
            className="mt-auto inline-flex h-12 items-center justify-center gap-sm rounded-lg border border-botanical-border px-xl text-sm font-bold text-primary transition-colors hover:bg-soft-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <SlidersHorizontal className="h-5 w-5" />
            Đặt lại
          </button>
        </div>
      </section>

      <section className="mt-xl flex flex-wrap items-center justify-between gap-md">
        <p className="text-body-lg text-ink-primary">
          <span className="font-bold text-primary">{filteredSpas.length}</span> spa phù hợp để tham khảo hôm nay
        </p>
        <div className="flex items-center gap-sm text-body-sm text-sage-secondary">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-success-leaf" />
          Chỉ hiển thị đối tác đang hoạt động công khai
        </div>
      </section>

      <section className="mt-xl">
        {isLoading ? (
          <LoadingSkeleton variant="card" count={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => void loadSpas()} />
        ) : filteredSpas.length === 0 ? (
          <EmptyState
            title="Chưa tìm thấy spa phù hợp"
            description="Anh Mạnh thử đổi từ khóa hoặc nới bộ lọc quận nhé. Dữ liệu mock hôm nay khá ngoan, nên nếu trống thì chắc bộ lọc đang hơi nghiêm khắc."
            action={<Link to="/app/bookings/new" className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-on-primary">Đi tới đặt lịch</Link>}
          />
        ) : (
          <div className="grid gap-xl lg:grid-cols-2 xl:grid-cols-3">
            {filteredSpas.map((spa, index) => (
              <SpaCard key={spa.id} spa={spa} imageSrc={getSpaListingImage(index)} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-section-gap overflow-hidden rounded-[28px] border border-botanical-border bg-surface-container-lowest shadow-stitch-soft lg:grid lg:grid-cols-[0.9fr_1.1fr]">
        <img src={footerImage} alt="Thông điệp thư giãn và lịch chăm sóc của JvJ" loading="lazy" className="h-full min-h-[280px] w-full object-cover" />
        <div className="flex flex-col justify-center gap-lg p-2xl">
          <StitchEyebrow>Lịch chăm sóc đều đặn</StitchEyebrow>
          <h2 className="text-h1 font-h1 text-ink-primary">Giữ nhịp phục hồi ổn định với lịch hẹn rõ ràng và spa đối tác đáng tin cậy</h2>
          <p className="text-body-lg text-sage-secondary">
            Khi cần trải nghiệm tại cơ sở hoặc muốn tham khảo không gian trước khi hẹn kỹ thuật viên, JvJ giúp Anh Mạnh nhìn nhanh khu vực, giờ mở cửa và thông tin liên hệ ngay trên một màn hình.
          </p>
          <div className="flex flex-wrap gap-md">
            <StitchButtonLink to="/app/calendar">Xem lịch tuần của tôi</StitchButtonLink>
            <StitchButtonLink to="/app/appointments" variant="secondary">Theo dõi lịch hẹn</StitchButtonLink>
          </div>
        </div>
      </section>
    </StitchContainer>
  );
}

function SummaryTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-botanical-border bg-surface-container-lowest p-lg shadow-stitch-soft">
      <div className="mb-sm inline-flex h-10 w-10 items-center justify-center rounded-full bg-soft-mint text-primary">{icon}</div>
      <p className="text-label-caption font-medium uppercase tracking-[0.14em] text-sage-secondary">{label}</p>
      <p className="mt-xs text-xl font-semibold text-ink-primary">{value}</p>
    </div>
  );
}

