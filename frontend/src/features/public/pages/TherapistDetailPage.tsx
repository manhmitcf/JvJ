import { type ReactNode, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  ShieldCheck,
  Star,
  Stethoscope,
  UserCheck,
  WalletCards,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/features/public/components/SectionHeading";
import { formatDuration, formatPrice, formatRating } from "@/features/public/lib/formatters";
import { getTherapistStitchImage, publicStitchAssets } from "@/features/public/lib/stitch-assets";
import { reviewService } from "@/services/review-service";
import { therapistService } from "@/services/therapist-service";
import { treatmentService } from "@/services/treatment-service";
import { ReviewList } from "@/features/reviews/components/ReviewList";

const therapistAreas = ["Hải Châu", "Sơn Trà", "Thanh Khê", "Ngũ Hành Sơn"];
const bookingPath = (therapistId: string) => `/login?redirect=${encodeURIComponent(`/app/bookings/new?therapistId=${therapistId}`)}`;
const bookingDates = ["Hôm nay", "Ngày mai", "Cuối tuần này"];
const timeSlots = ["09:00", "10:30", "14:00", "16:30", "19:00"];
const faqs = [
  {
    question: "Tôi có thể chọn kỹ thuật viên rồi mới chọn liệu trình không?",
    answer:
      "Có. Từ hồ sơ kỹ thuật viên, bạn vẫn xem được các liệu trình phù hợp trước khi chuyển sang bước đặt lịch chính thức.",
  },
  {
    question: "Hồ sơ chuyên môn có được JvJ xác minh không?",
    answer:
      "Có. JvJ chỉ công khai hồ sơ đã qua bước kiểm tra thông tin cơ bản và trạng thái duyệt để khách hàng an tâm hơn khi chọn dịch vụ.",
  },
  {
    question: "Lịch gợi ý trên trang này có phải lịch đặt ngay không?",
    answer:
      "Các mốc ngày và khung giờ trên trang hồ sơ mang tính tham khảo. Khi tiếp tục đặt lịch, hệ thống sẽ hiển thị lựa chọn phù hợp với liệu trình và khu vực của bạn.",
  },
];

const trustItems = [
  {
    title: "Hồ sơ xác minh",
    description: "Thông tin công khai rõ ràng",
    icon: ShieldCheck,
  },
  {
    title: "Chuyên môn đã duyệt",
    description: "Phù hợp trị liệu tại nhà",
    icon: UserCheck,
  },
  {
    title: "Đánh giá tích cực",
    description: "Từ các buổi đã hoàn thành",
    icon: Star,
  },
  {
    title: "Phục vụ tại Đà Nẵng",
    description: "Thuận tiện đặt lịch trong thành phố",
    icon: MapPin,
  },
];

export function TherapistDetailPage() {
  const { therapistId = "" } = useParams();

  const therapistQuery = useQuery({
    queryKey: ["public", "therapist", therapistId],
    queryFn: () => therapistService.getTherapist(therapistId),
  });
  const treatmentsQuery = useQuery({
    queryKey: ["public", "therapist-treatments", therapistId],
    queryFn: () => treatmentService.listTreatmentsByTherapist(therapistId),
  });
  const reviewsQuery = useQuery({
    queryKey: ["public", "reviews", therapistId],
    queryFn: () => reviewService.listReviewsByTherapist(therapistId),
  });

  const therapist = therapistQuery.data;
  const treatments = treatmentsQuery.data ?? [];
  const therapistReviews = useMemo(
    () => (reviewsQuery.data ?? []).slice(0, 3),
    [reviewsQuery.data],
  );

  if (therapistQuery.isLoading || treatmentsQuery.isLoading || reviewsQuery.isLoading) {
    return <LoadingSkeleton variant="card" count={1} />;
  }

  if (therapistQuery.isError || treatmentsQuery.isError || reviewsQuery.isError) {
    return <ErrorState message="Không thể tải hồ sơ kỹ thuật viên lúc này." />;
  }

  if (!therapist || therapist.status !== "approved") {
    return (
      <EmptyState
        title="Không tìm thấy kỹ thuật viên"
        description="Hồ sơ này có thể chưa được công khai hoặc đường dẫn chưa đúng."
      />
    );
  }

  const profileImage = getTherapistStitchImage(
    therapist.id,
    therapist.avatarUrl ?? publicStitchAssets.therapistSupport,
  );
  const averageRating = therapistReviews.length > 0
    ? therapistReviews.reduce((sum, review) => sum + review.rating, 0) / therapistReviews.length
    : therapist.rating;
  const certificateItems = buildCertificateItems(therapist.fullName, therapist.yearsOfExperience, therapist.certificateUrls.length);

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-6 md:px-8 md:py-8">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-text">
        <Link to="/" className="transition-colors hover:text-primary">Trang chủ</Link>
        <ChevronRight className="h-4 w-4" />
        <span>Kỹ thuật viên</span>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-sage-secondary">{therapist.fullName}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <section className="rounded-xl border border-botanical-border bg-surface-container-lowest p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="w-full shrink-0 md:w-1/3">
                <img
                  src={profileImage}
                  alt={therapist.fullName}
                  className="h-80 w-full rounded-xl object-cover object-top shadow-md"
                />
              </div>

              <div className="flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight text-ink-primary md:text-4xl">{therapist.fullName}</h1>
                  <Badge className="flex items-center gap-1 rounded-full border border-botanical-border bg-gentle-wash px-3 py-1 text-[12px] font-bold text-primary">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Đã duyệt hồ sơ
                  </Badge>
                </div>

                <p className="mb-4 text-base text-sage-secondary">
                  Chuyên môn: <span className="font-medium text-ink-primary">{therapist.specialties[0] ?? "Trị liệu tại nhà"}</span>
                </p>

                <div className="mb-6 flex flex-wrap items-center gap-6">
                  <div>
                    <div className="flex items-center gap-1 text-warning-clay">
                      <Star className="h-5 w-5 fill-warning-clay text-warning-clay" />
                      <span className="text-2xl font-bold text-ink-primary">{formatRating(averageRating)}</span>
                    </div>
                    <p className="text-sm text-muted-text">{therapist.completedBookings} lượt đặt</p>
                  </div>
                  <div className="hidden h-10 w-px bg-botanical-border md:block" />
                  <div>
                    <p className="text-2xl font-bold text-ink-primary">{therapist.yearsOfExperience} năm</p>
                    <p className="text-sm text-muted-text">Kinh nghiệm</p>
                  </div>
                </div>

                <div className="mb-6 flex items-center gap-2 text-sm text-sage-secondary">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>
                    Phục vụ: <span className="font-medium text-ink-primary">{therapistAreas.join(", ")}</span>
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to={bookingPath(therapist.id)}
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-primary-hover"
                  >
                    Tìm hiểu cách đặt lịch
                  </Link>
                  <a
                    href="#therapist-treatments"
                    className="inline-flex items-center justify-center rounded-xl border border-botanical-border bg-surface-container-low px-6 py-3 text-sm font-bold text-primary transition-all hover:bg-white"
                  >
                    Xem liệu trình cung cấp
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-botanical-border bg-white p-4 text-center"
                >
                  <Icon className="mx-auto mb-2 h-7 w-7 text-primary" />
                  <p className="text-sm font-bold text-ink-primary">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-text">{item.description}</p>
                </div>
              );
            })}
          </section>

          <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-botanical-border bg-white p-6">
              <h2 className="mb-4 text-2xl font-semibold text-ink-primary">Về tôi</h2>
              <p className="text-base leading-7 text-sage-secondary">
                Với hơn {therapist.yearsOfExperience} năm kinh nghiệm trong trị liệu tại nhà, {therapist.fullName} ưu tiên cách làm việc nhẹ nhàng,
                lắng nghe phản hồi cơ thể và điều chỉnh lực phù hợp với từng khách hàng. Hồ sơ này giúp bạn xem nhanh chuyên môn,
                kinh nghiệm và các liệu trình đang nhận trước khi quyết định đặt lịch.
              </p>

              <h3 className="mb-3 mt-6 text-lg font-semibold text-ink-primary">Kỹ năng chuyên môn</h3>
              <div className="flex flex-wrap gap-2">
                {therapist.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="rounded-full border border-botanical-border bg-soft-mint px-4 py-2 text-sm font-medium text-primary"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-botanical-border bg-white p-6">
              <h2 className="mb-4 text-2xl font-semibold text-ink-primary">Chứng chỉ & đào tạo</h2>
              <ul className="space-y-4">
                {certificateItems.map((certificate) => (
                  <li key={certificate.title} className="flex items-start gap-3">
                    <Award className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="font-bold text-ink-primary">{certificate.title}</p>
                      <p className="text-sm text-muted-text">{certificate.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="therapist-treatments">
            <div className="mb-4 flex items-end justify-between gap-4">
              <SectionHeading
                eyebrow="Các liệu trình cung cấp"
                title="Những lựa chọn đang nhận lịch"
              />
              <p className="text-sm text-sage-secondary">{treatments.length} liệu trình phù hợp</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {treatments.map((treatment, index) => (
                <article
                  key={treatment.id}
                  className="flex h-full flex-col rounded-xl border border-botanical-border bg-white p-5 shadow-sm"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-soft-mint text-primary">
                    {index % 3 === 0 ? <Stethoscope className="h-6 w-6" /> : null}
                    {index % 3 === 1 ? <ShieldCheck className="h-6 w-6" /> : null}
                    {index % 3 === 2 ? <BriefcaseBusiness className="h-6 w-6" /> : null}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-ink-primary">{treatment.name}</h3>
                  <p className="mb-4 flex-1 text-sm leading-6 text-muted-text">{treatment.description}</p>
                  <div className="mt-auto flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-primary">{formatPrice(treatment.price)}</p>
                      <p className="text-xs text-muted-text">{formatDuration(treatment.durationMinutes)}</p>
                    </div>
                    <Link
                      to={`/treatments/${treatment.id}`}
                      className="text-sm font-bold text-primary transition hover:underline"
                    >
                      Chi tiết
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-botanical-border bg-white p-6">
            <h2 className="mb-4 text-2xl font-semibold text-ink-primary">Đánh giá từ khách hàng</h2>
            <ReviewList therapistId={therapist.id} />
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-ink-primary">Câu hỏi thường gặp</h2>
            {faqs.map((faq, index) => (
              <details
                key={faq.question}
                className="rounded-xl border border-botanical-border bg-white p-5"
                open={index === 0}
              >
                <summary className="cursor-pointer list-none font-bold text-ink-primary">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm leading-6 text-sage-secondary">{faq.answer}</p>
              </details>
            ))}
          </section>
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-xl border border-botanical-border bg-white p-6 shadow-lg">
              <div className="mb-6 flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-primary">
                  <img src={profileImage} alt={therapist.fullName} loading="lazy" className="h-full w-full object-cover object-top" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-ink-primary">{therapist.fullName}</h3>
                  <div className="flex items-center gap-1 text-sm text-warning-clay">
                    <Star className="h-4 w-4 fill-warning-clay text-warning-clay" />
                    <span className="font-bold">{formatRating(averageRating)}</span>
                    <span className="text-muted-text">({therapistReviews.length} đánh giá hiển thị)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="mb-2 block text-xs font-bold uppercase tracking-wide text-ink-primary">Liệu trình đang nhận</div>
                  <div className="space-y-2 rounded-lg border border-botanical-border bg-warm-bg p-3">
                    {treatments.slice(0, 3).map((treatment) => (
                      <div key={treatment.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-ink-primary">{treatment.name}</span>
                        <span className="shrink-0 text-xs text-sage-secondary">{formatDuration(treatment.durationMinutes)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 block text-xs font-bold uppercase tracking-wide text-ink-primary">Khu vực của bạn</div>
                  <div className="rounded-lg border border-botanical-border bg-warm-bg px-4 py-3 text-sm text-sage-secondary">
                    {therapistAreas.join(" · ")}
                  </div>
                </div>

                <div>
                  <div className="mb-2 block text-xs font-bold uppercase tracking-wide text-ink-primary">Khung ngày tham khảo</div>
                  <div className="rounded-lg bg-gentle-wash px-4 py-3 text-sm leading-6 text-sage-secondary">
                    Kỹ thuật viên thường nhận lịch vào {bookingDates.join(", ").toLowerCase()}; lịch trống cụ thể sẽ được xác nhận ở bước đặt lịch.
                  </div>
                </div>

                <div>
                  <div className="mb-2 block text-xs font-bold uppercase tracking-wide text-ink-primary">Khung giờ thường nhận</div>
                  <div className="rounded-lg bg-gentle-wash px-4 py-3 text-sm leading-6 text-sage-secondary">
                    Các khung {timeSlots.join(", ")} là mốc thường được khách hàng quan tâm; hệ thống sẽ kiểm tra lịch thực tế khi bạn tiếp tục đặt lịch.
                  </div>
                </div>

                <Link
                  to={bookingPath(therapist.id)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-primary-hover"
                >
                  Tìm hiểu cách đặt lịch
                  <CalendarDays className="h-5 w-5" />
                </Link>

                <p className="text-center text-xs text-muted-text">Bạn chưa bị trừ tiền ở bước xem hồ sơ.</p>
              </div>
            </div>

            <div className="rounded-xl border border-botanical-border bg-gentle-wash p-4">
              <div className="flex items-start gap-3">
                <WalletCards className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm leading-6 text-ink-primary">
                  JvJ chỉ hiển thị hồ sơ kỹ thuật viên đã qua kiểm tra thông tin cơ bản và trạng thái chuyên môn trước khi công khai cho khách hàng.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

type ProfileStatProps = {
  readonly label: string;
  readonly value: string;
  readonly icon: ReactNode;
};

function ProfileStat({ label, value, icon }: ProfileStatProps) {
  return (
    <div className="rounded-xl border border-botanical-border bg-white p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-muted-text">{label}</div>
      <div className="mt-2 inline-flex items-center gap-2 text-base font-bold text-ink-primary">{icon}{value}</div>
    </div>
  );
}

function buildCertificateItems(name: string, yearsOfExperience: number, certificateCount: number) {
  return [
    {
      title: `Kinh nghiệm trị liệu tại nhà ${yearsOfExperience} năm`,
      description: `${name} có thời gian làm việc thực tế với các nhu cầu chăm sóc phục hồi và thư giãn tại nhà ở Đà Nẵng.`,
    },
    {
      title: `Hồ sơ chuyên môn có ${certificateCount} tệp xác minh`,
      description: "JvJ lưu trữ và đối soát thông tin hồ sơ trước khi hiển thị trạng thái đã duyệt trên trang công khai.",
    },
    {
      title: "Quy trình phục vụ ưu tiên an toàn và rõ ràng",
      description: "Khách hàng có thể xem trước chuyên môn, liệu trình và bước đặt lịch phù hợp trước khi xác nhận buổi hẹn.",
    },
  ];
}

function formatReviewDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Gần đây";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function renderStars(rating: number) {
  const fullStars = Math.round(rating);
  return Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={index < fullStars ? "h-4 w-4 fill-warning-clay text-warning-clay" : "h-4 w-4 text-botanical-border"}
    />
  ));
}

function buildInitials(seed: string) {
  const chars = seed
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return chars || "KH";
}
