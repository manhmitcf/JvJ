import { type ReactNode, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/features/public/components/SectionHeading";
import { formatDuration, formatPrice, formatRating, formatTreatmentCategory } from "@/features/public/lib/formatters";
import { getTreatmentStitchImage, getTherapistStitchImage, publicStitchAssets } from "@/features/public/lib/stitch-assets";
import { therapistService } from "@/services/therapist-service";
import { treatmentService } from "@/services/treatment-service";
import { ReviewList } from "@/features/reviews/components/ReviewList";
import { type Treatment } from "@/types/treatment";
import { reviewService } from "@/services/review-service";
import type { Review } from "@/types/review";

import { useAuthStore } from "@/features/auth/auth-store";

const getBookingPath = (isAuthenticated: boolean, treatmentId?: string) => {
  const bookingUrl = isAuthenticated ? "/app/bookings/new" : "/login?redirect=/app/bookings/new";
  return treatmentId ? `${bookingUrl}?treatmentId=${treatmentId}` : bookingUrl;
};

const suitableForByCategory: Record<string, string[]> = {
  neck_shoulder: [
    "Nhân viên văn phòng ngồi lâu, hay đau mỏi cổ vai gáy sau giờ làm.",
    "Người thường xuyên căng cơ vùng cổ, vai và hay bị bó cứng khi xoay đầu.",
    "Khách bận rộn tại Đà Nẵng muốn được chăm sóc tại nhà, không cần di chuyển.",
    "Người cần phục hồi nhẹ nhàng sau những ngày làm việc áp lực hoặc ngủ sai tư thế.",
  ],
  physical_therapy: [
    "Người cần phục hồi vận động nhẹ theo hướng dẫn an toàn tại nhà.",
    "Khách muốn theo dõi tiến độ cải thiện cùng kỹ thuật viên có chuyên môn.",
    "Người cần hỗ trợ giảm khó chịu sau sinh hoạt, vận động hoặc chấn thương nhẹ.",
    "Gia đình muốn chăm sóc người thân thuận tiện ngay tại Đà Nẵng.",
  ],
  recovery: [
    "Người vừa tập luyện, chơi thể thao hoặc vận động cường độ cao.",
    "Khách muốn thả lỏng cơ bắp và giảm cảm giác nặng người sau ngày dài.",
    "Người cần phục hồi nhịp sinh hoạt trước khi quay lại công việc thường ngày.",
    "Khách ưu tiên trị liệu tại nhà, kín đáo và đúng lịch hẹn.",
  ],
  acupressure: [
    "Người hay mỏi vùng lưng, cổ vai hoặc bàn chân do sinh hoạt và làm việc lâu một tư thế.",
    "Khách muốn chăm sóc bằng kỹ thuật day ấn có kiểm soát, không cần di chuyển tới spa.",
    "Người cần buổi trị liệu thư giãn sâu nhưng vẫn rõ thời lượng, giá và phạm vi phục vụ.",
    "Khách tại Đà Nẵng muốn đặt lịch tại nhà với kỹ thuật viên đã duyệt hồ sơ.",
  ],
  traditional_medicine: [
    "Người quan tâm phương pháp chăm sóc cơ thể theo hướng y học cổ truyền nhẹ nhàng.",
    "Khách cần hỗ trợ thư giãn, giảm căng cứng và cân bằng lại nhịp sinh hoạt.",
    "Gia đình muốn đặt lịch chăm sóc tại nhà cho người thân trong khu vực Đà Nẵng.",
    "Người muốn trao đổi kỹ nhu cầu trước khi xác nhận liệu trình chính thức.",
  ],
};

const benefitsByCategory: Record<string, string[]> = {
  neck_shoulder: [
    "Đánh giá sơ bộ tình trạng căng cơ và phạm vi vận động vùng cổ vai gáy.",
    "Tác động tập trung vào các điểm mỏi thường gặp, giúp cơ thể dễ chịu hơn.",
    "Tư vấn thói quen sinh hoạt và tư thế làm việc để hạn chế tái phát.",
    "Trải nghiệm chăm sóc tại nhà rõ ràng, riêng tư và thuận tiện.",
  ],
  physical_therapy: [
    "Hỗ trợ phục hồi vận động theo tình trạng hiện tại của khách hàng.",
    "Theo dõi mức độ đáp ứng sau từng buổi để điều chỉnh phù hợp hơn.",
    "Kết hợp hướng dẫn bài tập cơ bản có thể duy trì tại nhà.",
    "Giữ nhịp chăm sóc đều đặn mà không cần di chuyển nhiều.",
  ],
  recovery: [
    "Giúp thả lỏng cơ nhanh hơn sau vận động hoặc lịch sinh hoạt dày.",
    "Hỗ trợ giảm cảm giác nặng cơ, bí bách và căng cứng toàn thân.",
    "Gợi ý nhịp phục hồi phù hợp trước khi trở lại tập luyện hay làm việc.",
    "Tăng cảm giác thoải mái và dễ ngủ hơn sau buổi trị liệu.",
  ],
  acupressure: [
    "Tập trung day ấn các vùng thường căng mỏi theo nhu cầu đã trao đổi trước buổi hẹn.",
    "Giúp cơ thể thư giãn sâu hơn sau ngày dài làm việc hoặc di chuyển nhiều.",
    "Kỹ thuật viên theo dõi mức độ dễ chịu để điều chỉnh lực phù hợp trong buổi trị liệu.",
    "Trải nghiệm bấm huyệt tại nhà riêng tư, minh bạch giá và thời lượng.",
  ],
  traditional_medicine: [
    "Kết hợp chăm sóc cơ thể theo hướng y học cổ truyền nhẹ nhàng và dễ theo dõi.",
    "Hỗ trợ thư giãn, giảm căng cứng và tạo cảm giác cân bằng sau buổi hẹn.",
    "Kỹ thuật viên nhắc lại lưu ý sinh hoạt sau liệu trình để khách dễ duy trì hiệu quả.",
    "Đặt lịch tại nhà thuận tiện trong phạm vi phục vụ nội thành Đà Nẵng.",
  ],
};

const processSteps = [
  "Kỹ thuật viên xác nhận nhanh tình trạng hiện tại và mục tiêu buổi trị liệu.",
  "Thực hiện liệu trình tại nhà theo đúng thời lượng và phạm vi đã công khai.",
  "Nhắc lại lưu ý sau buổi hẹn để khách dễ duy trì hiệu quả trong sinh hoạt hằng ngày.",
];

const serviceAreas = ["Hải Châu", "Sơn Trà", "Thanh Khê", "Ngũ Hành Sơn"];
const popularSlots = ["09:00", "10:30", "14:00", "16:30", "19:00", "20:30"];

const faqs = [
  {
    question: "Liệu trình này có phù hợp với người lớn tuổi không?",
    answer:
      "Có thể phù hợp nếu tình trạng sức khỏe hiện tại cho phép. Khi tiếp tục đặt lịch, khách hàng nên mô tả thêm nhu cầu để JvJ sắp xếp kỹ thuật viên phù hợp hơn.",
  },
  {
    question: "Tôi cần chuẩn bị gì trước khi kỹ thuật viên tới?",
    answer:
      "Bạn chỉ cần chuẩn bị không gian yên tĩnh, thoáng và đủ riêng tư. Các lưu ý chi tiết sẽ được nhắc lại trước khi xác nhận booking chính thức.",
  },
  {
    question: "JvJ có phục vụ ngoài Đà Nẵng không?",
    answer:
      "Chưa. Ở giai đoạn hiện tại, JvJ chỉ nhận lịch trong phạm vi hành chính thành phố Đà Nẵng.",
  },
];

export function TreatmentDetailPage() {
  const { treatmentId = "" } = useParams();
  const authUser = useAuthStore((state) => state.user);
  const bookingPath = getBookingPath(Boolean(authUser), treatmentId);

  const treatmentQuery = useQuery({ queryKey: ["public", "treatment", treatmentId], queryFn: () => treatmentService.getTreatment(treatmentId) });
  const relatedTreatmentsQuery = useQuery({ queryKey: ["public", "treatments"], queryFn: () => treatmentService.listTreatments() });
  const reviewsQuery = useQuery({
    queryKey: ["public", "reviews", treatmentId],
    queryFn: () => reviewService.listReviewsByTreatment(treatmentId),
  });

  const therapistId = treatmentQuery.data?.therapistId;
  const therapistQuery = useQuery({
    queryKey: ["public", "therapist", therapistId],
    queryFn: () => therapistService.getTherapist(therapistId ?? ""),
    enabled: Boolean(therapistId),
  });

  const treatment = treatmentQuery.data;
  const therapist = therapistQuery.data;
  const treatmentReviews = reviewsQuery.data ?? [];
  const relatedTreatments = useMemo(() => {
    const treatments = relatedTreatmentsQuery.data ?? [];
    if (!treatment) return [];

    const sameCategory = treatments.filter((item) => item.id !== treatment.id && item.category === treatment.category);
    const otherCategory = treatments.filter((item) => item.id !== treatment.id && item.category !== treatment.category);

    return [...sameCategory, ...otherCategory].slice(0, 2);
  }, [relatedTreatmentsQuery.data, treatment]);

  const averageRating = useMemo(() => {
    if (!treatment) return 0;
    if (treatmentReviews.length === 0) return treatment.rating;
    return treatmentReviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / treatmentReviews.length;
  }, [treatment, treatmentReviews]);

  if (treatmentQuery.isLoading || relatedTreatmentsQuery.isLoading || reviewsQuery.isLoading || therapistQuery.isFetching) {
    return <LoadingSkeleton variant="card" count={1} />;
  }

  if (treatmentQuery.isError || relatedTreatmentsQuery.isError || reviewsQuery.isError || therapistQuery.isError) {
    return <ErrorState message="Không thể tải chi tiết liệu trình lúc này." />;
  }

  if (!treatment) {
    return <EmptyState title="Không tìm thấy liệu trình" description="Liệu trình này có thể chưa sẵn sàng hoặc đường dẫn chưa đúng." />;
  }

  const suitableFor = suitableForByCategory[treatment.category];
  const benefits = benefitsByCategory[treatment.category];

  // Dùng ảnh thật từ API nếu có, fallback về Stitch assets
  const heroImage = treatment.imageUrl || publicStitchAssets.treatmentDetailHero;
  const galleryImages = treatment.images && treatment.images.length > 0
    ? treatment.images.slice(0, 3)
    : [
        publicStitchAssets.treatmentDetailGallery[0],
        publicStitchAssets.treatmentDetailGallery[1],
        publicStitchAssets.treatmentDetailGallery[2],
      ];

  return (
    <div className="mx-auto max-w-max-width px-lg md:px-xl py-lg pb-section-gap">
      <div className="mb-xl flex flex-wrap items-center gap-sm text-label-caption text-sage-secondary">
        <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/treatments" className="hover:text-primary transition-colors">Liệu trình</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-foreground">{treatment.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-xl lg:grid-cols-12">
        <div className="space-y-section-gap lg:col-span-8">
          <section className="grid grid-cols-1 gap-xl md:grid-cols-2">
            <div className="group relative overflow-hidden rounded-3xl shadow-stitch">
              <img src={heroImage} alt={treatment.name} className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute left-lg top-lg rounded-full bg-white/90 px-md py-xs shadow-sm backdrop-blur-md">
                <div className="flex items-center gap-xs text-label-caption font-semibold text-foreground">
                  <Star className="h-4 w-4 fill-pending-amber text-pending-amber" />
                  {formatRating(averageRating)} ({treatmentReviews.length > 0 ? `${treatmentReviews.length} lượt đánh giá` : "chưa có đánh giá công khai"})
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <Badge className="mb-md w-fit rounded-full border-0 bg-soft-mint px-md py-xs text-label-caption font-semibold text-primary">
                {formatTreatmentCategory(treatment.category)}
              </Badge>
              <h1 className="text-4xl font-black tracking-tight text-ink-primary md:text-5xl">{treatment.name}</h1>
              <p className="mt-lg text-body text-on-surface-variant leading-relaxed">{treatment.description}</p>

              <div className="mt-xl flex flex-col gap-lg sm:flex-row">
                <Link to={bookingPath} className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-xl py-lg text-h3 font-black text-primary-foreground shadow-lg transition-all hover:bg-primary-hover active:scale-[0.98]">
                  Đặt lịch ngay
                </Link>
              </div>
            </div>
          </section>

          <section>
            <div className="rounded-3xl border border-botanical-border bg-primary p-xl text-on-primary shadow-lg">
              <h3 className="mb-xl flex items-center gap-md text-h2">
                <Sparkles className="h-5 w-5 text-on-primary-container" />
                Mô tả liệu trình
              </h3>
              <p className="text-body leading-relaxed">{treatment.description}</p>
            </div>
          </section>

          <section>
            <div className="rounded-3xl border border-botanical-border bg-surface-container-lowest p-xl shadow-sm">
              <SectionHeading eyebrow="Quy trình buổi hẹn" title="Diễn ra gọn gàng, rõ ràng tại nhà" />
              <div className="mt-xl space-y-lg">
                {processSteps.map((step, index) => (
                  <div key={step} className="flex items-start gap-md">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-soft-mint text-sm font-black text-primary">
                      {index + 1}
                    </div>
                    <p className="pt-1 text-body text-on-surface-variant">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-xl">
            <SectionHeading eyebrow="Không gian & cảm hứng" title="Không khí trị liệu nhẹ nhàng tại nhà" description="Một vài hình ảnh giúp bạn hình dung trải nghiệm thư giãn, riêng tư và được chuẩn bị chỉn chu trước buổi hẹn." />
            <div className="overflow-x-auto pb-md">
              <div className="flex gap-lg" style={{ width: `${galleryImages.length * 320}px` }}>
                {galleryImages.map((image, index) => (
                  <div key={image} className="shrink-0 overflow-hidden rounded-3xl" style={{ width: '300px', height: '240px' }}>
                    <img src={image} alt={`${treatment.name} - hình ${index + 1}`} loading="lazy" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-xl text-3xl font-black tracking-tight text-ink-primary">Đánh giá từ khách hàng</h2>
            <ReviewList treatmentId={treatment.id} />
          </section>
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-[100px] space-y-xl">
            <div className="overflow-hidden rounded-3xl border border-botanical-border bg-white/85 p-xl shadow-xl backdrop-blur-md">
              <h3 className="mb-xl flex items-center gap-md text-h2 text-on-surface">
                <Stethoscope className="h-5 w-5 text-primary" />
                Thông tin chi tiết
              </h3>
              <div className="space-y-lg">
                <InfoRow label="Tên liệu trình" value={treatment.name} />
                <InfoRow label="Danh mục" value={formatTreatmentCategory(treatment.category)} />
                <InfoRow label="Giá" value={formatPrice(treatment.price)} />
                <InfoRow label="Thời lượng" value={formatDuration(treatment.durationMinutes)} />
                <InfoRow label="Đánh giá" value={`${formatRating(averageRating)} (${treatmentReviews.length} lượt)`} />
                <InfoRow label="Trạng thái" value={treatment.isAvailable ? "Đang hoạt động" : "Tạm ngưng"} />
              </div>

              <Link to={bookingPath} className="mb-md mt-xl inline-flex w-full items-center justify-center rounded-xl bg-primary px-xl py-lg text-h3 font-black text-on-primary shadow-lg transition-all hover:bg-primary-hover active:scale-[0.98]">
                Đặt lịch ngay
              </Link>
              <p className="text-center text-label-caption text-sage-secondary">Bạn sẽ chưa bị trừ tiền ở bước này</p>
            </div>

            <div className="rounded-3xl border border-botanical-border bg-surface-container-low p-xl">
              <h4 className="mb-xl text-h3 text-on-surface">Liệu trình liên quan</h4>
              <div className="space-y-lg">
                {relatedTreatments.map((item, index) => (
                  <RelatedTreatment
                    key={item.id}
                    treatment={item}
                    image={item.imageUrl || getTreatmentStitchImage(item.id, publicStitchAssets.treatmentDetailGallery[index + 2])}
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

type MetricTileProps = {
  readonly label: string;
  readonly value: string;
  readonly icon: ReactNode;
};

function MetricTile({ label, value, icon }: MetricTileProps) {
  return (
    <div className="flex items-center gap-md rounded-xl bg-surface-container-low p-md">
      {icon}
      <div>
        <div className="text-label-caption text-sage-secondary">{label}</div>
        <div className="text-body font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );
}

type StatusPillProps = {
  readonly children: ReactNode;
  readonly icon: ReactNode;
  readonly tone: "primary" | "success";
};

function StatusPill({ children, icon, tone }: StatusPillProps) {
  const classes = tone === "success"
    ? "bg-gentle-wash text-success-leaf"
    : "bg-soft-mint text-primary";

  return (
    <div className={`flex items-center gap-xs rounded-full px-md py-xs text-label-caption font-semibold ${classes}`}>
      {icon}
      {children}
    </div>
  );
}

type FeaturePanelProps = {
  readonly title: string;
  readonly icon: ReactNode;
  readonly tone: "light" | "primary";
  readonly items: string[];
};

function FeaturePanel({ title, icon, tone, items }: FeaturePanelProps) {
  const wrapperClass = tone === "primary"
    ? "bg-primary text-on-primary shadow-lg"
    : "border border-botanical-border bg-surface-container-lowest shadow-sm";
  const iconClass = tone === "primary" ? "text-on-primary-container" : "text-primary";
  const itemTextClass = tone === "primary" ? "text-on-primary" : "text-body";

  return (
    <div className={`rounded-3xl p-xl ${wrapperClass}`}>
      <h3 className="flex items-center gap-md text-h2">
        <span className={iconClass}>{icon}</span>
        {title}
      </h3>
      <ul className="mt-xl space-y-lg">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-md">
            <CheckCircle2 className={`mt-1 h-5 w-5 shrink-0 ${iconClass}`} />
            <span className={itemTextClass}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type CompactStatProps = {
  readonly label: string;
  readonly value: string;
};

function CompactStat({ label, value }: CompactStatProps) {
  return (
    <div className="rounded-xl bg-warm-bg p-md">
      <div className="text-label-caption text-sage-secondary">{label}</div>
      <div className="mt-xs text-sm font-black text-foreground">{value}</div>
    </div>
  );
}

type InfoBlockProps = {
  readonly label: string;
  readonly children: ReactNode;
};

function InfoBlock({ label, children }: InfoBlockProps) {
  return (
    <div>
      <div className="mb-xs text-label-caption text-sage-secondary">{label}</div>
      {children}
    </div>
  );
}

type InfoRowProps = {
  readonly label: string;
  readonly value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-start justify-between gap-md border-b border-botanical-border pb-md last:border-0 last:pb-0">
      <span className="text-body text-sage-secondary">{label}</span>
      <span className="text-body font-semibold text-foreground text-right">{value}</span>
    </div>
  );
}

type RelatedTreatmentProps = {
  readonly treatment: Treatment;
  readonly image: string;
};

function RelatedTreatment({ treatment, image }: RelatedTreatmentProps) {
  return (
    <Link to={`/treatments/${treatment.id}`} className="group flex gap-md">
      <div className="h-16 w-16 overflow-hidden rounded-lg bg-surface-container shrink-0">
        <img src={image} alt={treatment.name} loading="lazy" className="h-full w-full object-cover" />
      </div>
      <div className="flex-1">
        <div className="text-body font-bold text-foreground transition-colors group-hover:text-primary">{treatment.name}</div>
        <div className="text-label-caption text-sage-secondary">{formatPrice(treatment.price)}</div>
      </div>
    </Link>
  );
}

function buildTherapistSubtitle(yearsOfExperience: number, specialties: string[]) {
  const focus = specialties[0] ?? "Trị liệu tại nhà";
  return `${focus} - ${yearsOfExperience} năm kinh nghiệm`;
}

function renderStars(rating: number) {
  const fullStars = Math.round(rating);
  return Array.from({ length: 5 }, (_, index) => (
    <Star key={index} className={index < fullStars ? "h-5 w-5 fill-pending-amber text-pending-amber" : "h-5 w-5 text-botanical-border"} />
  ));
}
