import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock3, Search, SlidersHorizontal, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StitchContainer } from "@/features/public/components/StitchPublicPrimitives";
import { formatDuration, formatPrice, formatRating, formatTreatmentCategory } from "@/features/public/lib/formatters";
import { getTreatmentStitchImage } from "@/features/public/lib/stitch-assets";
import { therapistService } from "@/services/therapist-service";
import { treatmentService } from "@/services/treatment-service";
import { type Treatment, type TreatmentCategory } from "@/types/treatment";
import { type Therapist } from "@/types/therapist";

const categories: { label: string; value: "all" | TreatmentCategory }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Massage trị liệu", value: "neck_shoulder" },
  { label: "Vật lý trị liệu", value: "physical_therapy" },
  { label: "Phục hồi sau vận động", value: "recovery" },
  { label: "Bấm huyệt", value: "acupressure" },
  { label: "Y học cổ truyền", value: "traditional_medicine" },
];

const sortOptions = [
  { label: "Phù hợp nổi bật", value: "featured" },
  { label: "Giá tăng dần", value: "price-asc" },
  { label: "Giá giảm dần", value: "price-desc" },
  { label: "Đánh giá cao", value: "rating-desc" },
] as const;

const supportNeeds = ["Cổ vai gáy", "Căng cơ", "Stress", "Phục hồi vận động", "Đau lưng"];
const durations = ["45 phút", "60 phút", "75 phút", "90 phút"];
const scheduleOptions = ["Có khung giờ hôm nay", "Có khung giờ ngày mai"];

function getAvailabilityLabel(treatment: Treatment) {
  if (treatment.isAvailable) {
    return {
      text: "Có khung giờ hôm nay",
      className: "bg-primary text-primary-foreground",
    };
  }

  if (treatment.rating >= 4.8) {
    return {
      text: "Nhiều kỹ thuật viên phù hợp",
      className: "bg-secondary-container text-on-secondary-container",
    };
  }

  return {
    text: "Đã duyệt hồ sơ",
    className: "bg-soft-mint text-primary",
  };
}

function getTreatmentMetaLabel(treatment: Treatment) {
  switch (treatment.category) {
    case "neck_shoulder":
      return "Giảm đau cổ vai gáy";
    case "recovery":
      return "Phục hồi sau vận động";
    default:
      return formatTreatmentCategory(treatment.category);
  }
}

function getTherapistFilterSummary(therapists: Therapist[]) {
  const experiencedCount = therapists.filter((therapist) => therapist.yearsOfExperience >= 5).length;

  return [
    `Đã duyệt hồ sơ (${therapists.length})`,
    `Từ 5 năm kinh nghiệm (${experiencedCount})`,
  ];
}

function matchesDurationFilter(treatment: Treatment, selectedDurations: string[]) {
  return selectedDurations.length === 0 || selectedDurations.includes(formatDuration(treatment.durationMinutes));
}

function matchesSupportNeedFilter(treatment: Treatment, selectedSupportNeeds: string[]) {
  if (selectedSupportNeeds.length === 0) {
    return true;
  }

  const searchable = `${treatment.name} ${treatment.description} ${formatTreatmentCategory(treatment.category)} ${getTreatmentMetaLabel(treatment)}`.toLowerCase();

  return selectedSupportNeeds.some((need) => searchable.includes(need.toLowerCase()));
}

function toggleFilterValue(current: string[], value: string) {
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}

export function TreatmentListingPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]["value"]>("all");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]["value"]>("featured");
  const [selectedSupportNeeds, setSelectedSupportNeeds] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);

  const treatmentsQuery = useQuery({ queryKey: ["public", "treatments"], queryFn: () => treatmentService.listTreatments() });
  const therapistsQuery = useQuery({ queryKey: ["public", "approved-therapists"], queryFn: () => therapistService.listApprovedTherapists() });

  const filteredTreatments = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const next = (treatmentsQuery.data?.treatments ?? [])
      .filter((treatment) => (selectedCategory === "all" ? true : treatment.category === selectedCategory))
      .filter((treatment) => (onlyAvailable ? treatment.isAvailable : true))
      .filter((treatment) => (matchesDurationFilter(treatment, selectedDurations)))
      .filter((treatment) => (matchesSupportNeedFilter(treatment, selectedSupportNeeds)))
      .filter((treatment) => (keyword ? `${treatment.name} ${treatment.description}`.toLowerCase().includes(keyword) : true))
      .slice();

    next.sort((left, right) => {
      switch (sortBy) {
        case "price-asc":
          return left.price - right.price;
        case "price-desc":
          return right.price - left.price;
        case "rating-desc":
          return right.rating - left.rating;
        default:
          return Number(right.isAvailable) - Number(left.isAvailable) || right.rating - left.rating || left.price - right.price;
      }
    });

    return next;
  }, [onlyAvailable, search, selectedCategory, selectedDurations, selectedSupportNeeds, sortBy, treatmentsQuery.data]);

  if (treatmentsQuery.isLoading || therapistsQuery.isLoading) {
    return <LoadingSkeleton variant="card" count={6} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" />;
  }

  if (treatmentsQuery.isError || therapistsQuery.isError) {
    return <ErrorState message="Không thể tải danh sách liệu trình lúc này." />;
  }

  const treatments = treatmentsQuery.data?.treatments ?? [];
  const therapists = therapistsQuery.data ?? [];
  const therapistFilterItems = getTherapistFilterSummary(therapists);

  return (
    <StitchContainer className="py-2xl pb-section-gap">
      <section className="relative z-10 mb-2xl">
        <div className="flex flex-col gap-lg rounded-xl border border-botanical-border bg-surface-container-lowest p-xl shadow-stitch-soft md:flex-row md:items-end">
          <div className="w-full flex-1">
            <label htmlFor="treatment-search" className="mb-sm ml-xs block text-label-caption font-medium text-sage-secondary">Tìm kiếm liệu trình</label>
            <div className="relative">
              <Search className="absolute left-md top-1/2 h-5 w-5 -translate-y-1/2 text-outline" />
              <Input
                id="treatment-search"
                name="treatment-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-12 w-full rounded-lg border-botanical-border bg-surface pl-3xl pr-lg focus:border-primary focus:ring-primary"
                placeholder="Ví dụ: cổ vai gáy, căng cơ, phục hồi vận động"
              />
            </div>
          </div>

          <div className="w-full md:w-48">
            <label className="mb-sm ml-xs block text-label-caption font-medium text-sage-secondary">Khu vực</label>
            <div className="flex h-12 items-center rounded-lg border border-botanical-border bg-surface px-lg text-body text-sage-secondary">
              Đà Nẵng (Tất cả)
            </div>
          </div>

          <div className="w-full md:w-48">
            <label htmlFor="treatment-sort" className="mb-sm ml-xs block text-label-caption font-medium text-sage-secondary">Sắp xếp</label>
            <select
              id="treatment-sort"
              name="treatment-sort"
              aria-label="Sắp xếp liệu trình"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as (typeof sortOptions)[number]["value"])}
              className="h-12 w-full rounded-lg border border-botanical-border bg-surface px-lg text-body text-ink-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedCategory("all");
              setOnlyAvailable(false);
              setSortBy("featured");
              setSelectedSupportNeeds([]);
              setSelectedDurations([]);
            }}
            className="inline-flex h-12 items-center justify-center gap-sm rounded-lg border border-botanical-border px-xl text-sm font-bold text-primary transition-colors hover:bg-soft-mint"
          >
            <SlidersHorizontal className="h-5 w-5" />
            Đặt lại
          </button>
        </div>
      </section>

      <section className="mb-xl overflow-x-auto">
        <div className="flex min-w-max gap-md border-b border-botanical-border">
          {categories.map((category) => {
            const active = selectedCategory === category.value;

            return (
              <button
                key={category.value}
                type="button"
                onClick={() => setSelectedCategory(category.value)}
                className={active
                  ? "border-b-2 border-primary px-xl py-md font-bold text-primary"
                  : "px-xl py-md text-on-surface-variant transition-colors hover:text-primary"}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3xl lg:grid-cols-[280px_1fr]">
        <aside className="space-y-2xl">
          <SidebarFilterGroup
            title="Nhu cầu hỗ trợ"
            items={supportNeeds}
            selectedItems={selectedSupportNeeds}
            onToggleItem={(item) => setSelectedSupportNeeds((current) => toggleFilterValue(current, item))}
          />
          <SidebarFilterGroup
            title="Thời lượng"
            items={durations}
            selectedItems={selectedDurations}
            onToggleItem={(item) => setSelectedDurations((current) => toggleFilterValue(current, item))}
            withDivider
          />
          <SidebarAvailabilityGroup checked={onlyAvailable} onCheckedChange={setOnlyAvailable} items={scheduleOptions} />
          <SidebarInfoGroup title="Kỹ thuật viên" items={therapistFilterItems} withDivider />
        </aside>

        <section>
          <div className="mb-xl flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
            <p className="text-body-lg">
              <span className="font-bold text-primary">{filteredTreatments.length}</span> liệu trình để tham khảo
            </p>
            <div className="flex items-center gap-md">
              <label htmlFor="treatment-inline-sort" className="text-body-sm text-sage-secondary">Sắp xếp:</label>
              <select
                id="treatment-inline-sort"
                name="treatment-inline-sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as (typeof sortOptions)[number]["value"])}
                className="cursor-pointer border-none bg-transparent py-0 pl-0 pr-lg font-medium text-primary outline-none focus:ring-0"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredTreatments.length === 0 ? (
            <EmptyState
              title="Chưa có liệu trình phù hợp"
              description="Thử đổi từ khóa hoặc nới bộ lọc để xem thêm lựa chọn nhé."
            />
          ) : (
            <div className="space-y-xl">
              {filteredTreatments.map((treatment) => (
                <ListingTreatmentCard key={treatment.id} treatment={treatment} />
              ))}
            </div>
          )}
        </section>
      </div>
    </StitchContainer>
  );
}

type SidebarFilterGroupProps = {
  readonly title: string;
  readonly items: string[];
  readonly dynamicItems?: string[];
  readonly selectedItems?: string[];
  readonly onToggleItem?: (item: string) => void;
  readonly withDivider?: boolean;
};

function SidebarFilterGroup({ title, items, dynamicItems, selectedItems = [], onToggleItem, withDivider = false }: SidebarFilterGroupProps) {
  const renderedItems = dynamicItems ?? items;

  return (
    <div className={withDivider ? "border-t border-botanical-border pt-xl" : ""}>
      <h3 className="mb-lg text-h3 font-h3">{title}</h3>
      <div className="space-y-md">
        {renderedItems.map((item) => {
          const interactive = Boolean(onToggleItem);

          return (
            <label key={item} className={`flex items-center gap-md ${interactive ? "group cursor-pointer" : "cursor-default"}`}>
              <input
                type="checkbox"
                checked={selectedItems.includes(item)}
                onChange={() => onToggleItem?.(item)}
                disabled={!interactive}
                className="rounded border-botanical-border text-primary focus:ring-primary disabled:cursor-default disabled:opacity-60"
              />
              <span className={`text-body transition-colors ${interactive ? "group-hover:text-primary" : ""}`}>{item}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

type SidebarInfoGroupProps = {
  readonly title: string;
  readonly items: string[];
  readonly withDivider?: boolean;
};

function SidebarInfoGroup({ title, items, withDivider = false }: SidebarInfoGroupProps) {
  return (
    <div className={withDivider ? "border-t border-botanical-border pt-xl" : ""}>
      <h3 className="mb-lg text-h3 font-h3">{title}</h3>
      <div className="space-y-sm">
        {items.map((item) => (
          <div key={item} className="rounded-lg bg-gentle-wash px-md py-sm text-body-sm text-sage-secondary">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

type SidebarAvailabilityGroupProps = {
  readonly checked: boolean;
  readonly onCheckedChange: (next: boolean) => void;
  readonly items: string[];
};

function SidebarAvailabilityGroup({ checked, onCheckedChange, items }: SidebarAvailabilityGroupProps) {
  return (
    <div className="border-t border-botanical-border pt-xl">
      <h3 className="mb-lg text-h3 font-h3">Trạng thái lịch</h3>
      <div className="space-y-md">
        <label className="group flex cursor-pointer items-center gap-md">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => onCheckedChange(event.target.checked)}
            className="rounded border-botanical-border text-primary focus:ring-primary"
          />
          <span className="text-body transition-colors group-hover:text-primary">{items[0]}</span>
        </label>
        <label className="flex cursor-default items-center gap-md opacity-60">
          <input type="checkbox" disabled className="rounded border-botanical-border text-primary focus:ring-primary disabled:cursor-default" />
          <span className="text-body">{items[1]}</span>
        </label>
      </div>
    </div>
  );
}

type ListingTreatmentCardProps = {
  readonly treatment: Treatment;
};

function ListingTreatmentCard({ treatment }: ListingTreatmentCardProps) {
  const imageSrc = getTreatmentStitchImage(treatment.id, treatment.imageUrl);
  const availability = getAvailabilityLabel(treatment);

  return (
    <article className="group overflow-hidden rounded-xl border border-botanical-border bg-surface-container-lowest transition-all hover:border-primary">
      <div className="flex flex-col md:flex-row">
        <div className="relative h-48 overflow-hidden md:h-auto md:w-64">
          <img src={imageSrc} alt={treatment.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute left-md top-md">
            <Badge className={`rounded-full px-md py-xs text-label-caption font-bold ${availability.className}`}>
              {availability.text}
            </Badge>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-xl">
          <div className="mb-sm flex items-start justify-between gap-md">
            <div>
              <span className="mb-xs block text-label-caption font-bold uppercase tracking-wider text-primary">{getTreatmentMetaLabel(treatment)}</span>
              <h2 className="text-h2 font-h2 text-ink-primary">{treatment.name}</h2>
            </div>
            <div className="flex items-center gap-xs text-pending-amber">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-bold">{formatRating(treatment.rating)}</span>
            </div>
          </div>

          <p className="mb-lg text-body text-sage-secondary">{treatment.description}</p>

          <div className="mb-xl flex flex-wrap items-center gap-xl">
            <div className="flex items-center gap-sm text-sage-secondary">
              <Clock3 className="h-4 w-4" />
              <span>{formatDuration(treatment.durationMinutes)}</span>
            </div>
            <div className="text-h3 font-h3 text-primary">{formatPrice(treatment.price)}</div>
          </div>

          <div className="mt-auto flex flex-wrap gap-md">
            <Link
              to={`/treatments/${treatment.id}`}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-primary px-xl text-sm font-bold text-on-primary transition-all hover:bg-primary-hover active:scale-95"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
