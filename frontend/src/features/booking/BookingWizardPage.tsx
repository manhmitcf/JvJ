import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  HeartPulse,
  Home,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useBookingWizardStore } from "@/features/booking/stores/booking-wizard-store";
import { useSpaStore } from "@/features/spas/stores/spa-store";
import { getSpaMapImage } from "@/features/spas/components/spa-assets";
import { cn } from "@/utils/cn";
import type { Treatment } from "@/types/treatment";
import type { Therapist } from "@/types/therapist";
import type { TimeSlot } from "@/types/time-slot";
import type { Spa } from "@/types/spa";
import type { Booking } from "@/types/booking";

const steps = [
  { id: 1, label: "Liệu trình" },
  { id: 2, label: "Thời gian" },
  { id: 3, label: "Địa chỉ" },
  { id: 4, label: "Sức khỏe" },
  { id: 5, label: "Xác nhận" },
];

const healthOptions = [
  "Đau cấp tính hoặc đau tăng nhanh",
  "Đang mang thai",
  "Dị ứng dầu xoa bóp hoặc hương liệu",
  "Có bệnh nền cần lưu ý",
  "Vừa phẫu thuật hoặc chấn thương",
  "Không có tình trạng đặc biệt",
];

export function BookingWizardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const spaId = searchParams.get("spaId");
  const treatmentId = searchParams.get("treatmentId"); // Lấy treatmentId từ URL

  const {
    currentStep,
    completedSteps,
    selectedTreatment,
    selectedTherapist,
    treatments,
    treatmentPage,
    treatmentPageCount,
    treatmentTotalCount,
    therapists,
    selectedDate,
    selectedTimeSlot,
    availableSlots,
    address,
    contactPhone,
    addressNote,
    healthInfo,
    createdBooking,
    isLoadingTreatments,
    isLoadingTherapists,
    isLoadingSlots,
    isCreatingBooking,
    error,
    setCurrentStep,
    loadTreatments,
    loadTherapists,
    selectTreatment,
    selectTherapist,
    selectDate,
    selectTimeSlot,
    setAddress,
    setHealthInfo,
    createBooking,
  } = useBookingWizardStore();

  const [treatmentSearch, setTreatmentSearch] = useState("");
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { spas, loadSpas } = useSpaStore();
  const selectedSpa = useMemo(() => spas.find((spa) => spa.id === spaId && spa.status === "active") ?? null, [spas, spaId]);

  useEffect(() => {
    void loadTreatments({ page: 1 });
    void loadTherapists();
    void loadSpas();
  }, [loadTreatments, loadTherapists, loadSpas]);

  // Auto-select treatment: ưu tiên treatmentId từ URL, nếu không có thì chọn đầu tiên
  useEffect(() => {
    if (treatments.length > 0 && !selectedTreatment) {
      if (treatmentId) {
        const targetTreatment = treatments.find((t) => t.id === treatmentId);
        if (targetTreatment) {
          selectTreatment(targetTreatment);
        } else {
          selectTreatment(treatments[0]);
        }
      } else {
        selectTreatment(treatments[0]);
      }
    }
  }, [treatments, selectedTreatment, selectTreatment, treatmentId]);

  useEffect(() => {
    if (therapists.length > 0 && !selectedTherapist) {
      selectTherapist(therapists[0]);
    }
  }, [therapists, selectedTherapist, selectTherapist]);

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-lg">
      <div className="flex flex-col gap-md rounded-3xl border border-botanical-border bg-white/80 p-lg shadow-stitch-soft lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-sm flex flex-wrap items-center gap-xs text-label-caption text-sage-secondary">
            <Link to="/treatments" className="transition-colors hover:text-primary">Liệu trình</Link>
            {selectedSpa ? (
              <>
                <ChevronRight className="h-4 w-4" />
                <Link to={`/spas/${selectedSpa.id}`} className="transition-colors hover:text-primary">{selectedSpa.name}</Link>
              </>
            ) : null}
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold text-foreground">Đặt lịch</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-ink-primary">Đặt lịch trị liệu tại nhà</h1>
          <p className="mt-xs max-w-2xl text-body-sm text-sage-secondary">
            Chọn thời gian, địa chỉ và thông tin cần lưu ý để kỹ thuật viên chuẩn bị tốt nhất.
          </p>
        </div>
      </div>

      {selectedSpa ? <SelectedSpaBanner spa={selectedSpa} /> : null}

      <Stepper currentStep={currentStep} completedSteps={completedSteps} onSelectStep={setCurrentStep} />

      <div className="grid gap-xl xl:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <main className="space-y-lg">
          {currentStep === 1 ? (
            <TreatmentStep
              treatments={treatments}
              treatmentPage={treatmentPage}
              treatmentPageCount={treatmentPageCount}
              treatmentTotalCount={treatmentTotalCount}
              treatmentSearch={treatmentSearch}
              therapists={therapists}
              selectedTreatment={selectedTreatment}
              selectedTherapist={selectedTherapist}
              isLoading={isLoadingTreatments || isLoadingTherapists}
              onSelectTreatment={selectTreatment}
              onSelectTherapist={selectTherapist}
              onSearchChange={(q) => {
                setTreatmentSearch(q);
                if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
                searchTimeoutRef.current = setTimeout(() => {
                  void loadTreatments({ page: 1, search: q });
                }, 350);
              }}
              onPageChange={(page) => void loadTreatments({ page })}
              onNext={() => setCurrentStep(2)}
            />
          ) : null}
          {currentStep === 2 ? (
            <TimeStep
              selectedDate={selectedDate}
              selectedTimeSlot={selectedTimeSlot}
              availableSlots={availableSlots}
              isLoading={isLoadingSlots}
              onSelectDate={selectDate}
              onSelectTimeSlot={selectTimeSlot}
              onBack={() => setCurrentStep(1)}
              onNext={() => setCurrentStep(3)}
            />
          ) : null}
          {currentStep === 3 ? (
            <AddressStep
              address={address}
              contactPhone={contactPhone}
              addressNote={addressNote}
              bookingAddressImage={getSpaMapImage()}
              onSave={(addr, phone, note, save) => {
                setAddress(addr, phone, note, save);
                setCurrentStep(4);
              }}
              onBack={() => setCurrentStep(2)}
            />
          ) : null}
          {currentStep === 4 ? (
            <HealthStep
              healthInfo={healthInfo}
              onSave={(info) => {
                setHealthInfo(info);
                setCurrentStep(5);
              }}
              onBack={() => setCurrentStep(3)}
            />
          ) : null}
          {currentStep === 5 ? (
            <ConfirmStep
              selectedTreatment={selectedTreatment}
              selectedTherapist={selectedTherapist}
              selectedTimeSlot={selectedTimeSlot}
              address={address}
              contactPhone={contactPhone}
              healthInfo={healthInfo}
              createdBooking={createdBooking}
              isCreating={isCreatingBooking}
              selectedSpaName={selectedSpa?.name}
              onBack={() => setCurrentStep(4)}
              onCreate={createBooking}
              onViewBooking={() => createdBooking && navigate(`/app/appointments/${createdBooking.id}`)}
            />
          ) : null}
        </main>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BookingSummary
            currentStep={currentStep}
            selectedTreatment={selectedTreatment}
            selectedTherapist={selectedTherapist}
            selectedTimeSlot={selectedTimeSlot}
            address={address}
            selectedSpa={selectedSpa}
          />
        </aside>
      </div>
    </div>
  );
}

function SelectedSpaBanner({ spa }: { spa: { id: string; name: string; address: string; district: string; openTime: string; closeTime: string } }) {
  return (
    <section className="rounded-3xl border border-secondary-container bg-gentle-wash p-lg shadow-stitch-soft">
      <div className="flex flex-col gap-md lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-xs inline-flex items-center gap-xs rounded-full bg-soft-mint px-md py-xs text-label-caption font-bold text-primary">
            <MapPin className="h-4 w-4" /> Spa đối tác đã chọn
          </div>
          <h2 className="text-xl font-black text-ink-primary">Đang đặt lịch với {spa.name}</h2>
          <p className="mt-xs text-body-sm text-sage-secondary">{spa.address}</p>
        </div>
        <div className="grid gap-sm text-body-sm text-sage-secondary sm:grid-cols-2 lg:min-w-[360px]">
          <div className="rounded-2xl border border-botanical-border bg-white/80 p-md">
            <span className="block text-label-caption font-semibold uppercase tracking-[0.14em]">Khu vực</span>
            <strong className="text-ink-primary">{spa.district}</strong>
          </div>
          <div className="rounded-2xl border border-botanical-border bg-white/80 p-md">
            <span className="block text-label-caption font-semibold uppercase tracking-[0.14em]">Giờ mở cửa</span>
            <strong className="text-ink-primary">{spa.openTime} - {spa.closeTime}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stepper({
  currentStep,
  completedSteps,
  onSelectStep,
}: {
  currentStep: number;
  completedSteps: number[];
  onSelectStep: (step: number) => void;
}) {
  return (
    <Card className="overflow-hidden rounded-3xl border-botanical-border bg-white p-md shadow-stitch-soft">
      <div className="grid gap-sm md:grid-cols-5 2xl:gap-lg">
        {steps.map((step) => {
          const completed = completedSteps.includes(step.id);
          const active = currentStep === step.id;

          return (
            <button key={step.id} type="button" onClick={() => onSelectStep(step.id)} className="group flex items-center gap-md text-left">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-black transition-all",
                  active && "border-primary bg-primary text-on-primary shadow-md",
                  completed && "border-primary bg-soft-mint text-primary",
                  !active && !completed && "border-botanical-border bg-surface-container-low text-sage-secondary"
                )}
              >
                {completed ? <Check className="h-4 w-4" /> : step.id}
              </span>
              <span>
                <span className={cn("block text-label-caption", active ? "text-primary" : "text-sage-secondary")}>Bước {step.id}</span>
                <span className={cn("block text-sm font-bold", active ? "text-ink-primary" : "text-sage-secondary")}>{step.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function TreatmentStep({
  treatments,
  treatmentPage,
  treatmentPageCount,
  treatmentTotalCount,
  treatmentSearch,
  therapists,
  selectedTreatment,
  selectedTherapist,
  isLoading,
  onSelectTreatment,
  onSelectTherapist,
  onSearchChange,
  onPageChange,
  onNext,
}: {
  treatments: Treatment[];
  treatmentPage: number;
  treatmentPageCount: number;
  treatmentTotalCount: number;
  treatmentSearch: string;
  therapists: Therapist[];
  selectedTreatment: Treatment | null;
  selectedTherapist: Therapist | null;
  isLoading: boolean;
  onSelectTreatment: (treatment: Treatment) => void;
  onSelectTherapist: (therapist: Therapist) => void;
  onSearchChange: (query: string) => void;
  onPageChange: (page: number) => void;
  onNext: () => void;
}) {
  if (isLoading) {
    return <LoadingState message="Đang tải liệu trình và kỹ thuật viên..." />;
  }

  if (!selectedTreatment || !selectedTherapist) {
    return <ErrorState message="Không tìm thấy liệu trình hoặc kỹ thuật viên khả dụng" />;
  }

  return (
    <StepCard
      icon={<Sparkles />}
      title="Chọn liệu trình"
      description="Chọn liệu trình và kỹ thuật viên phù hợp với nhu cầu của bạn."
    >
      {/* Danh sách treatments */}
      <div>
        <h3 className="mb-md text-sm font-black text-ink-primary">Chọn liệu trình</h3>
        <div className="mb-md flex items-center gap-md">
          <Input
            value={treatmentSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm liệu trình..."
            className="h-10 max-w-sm rounded-xl"
          />
          <span className="text-label-caption text-sage-secondary">{treatmentTotalCount} liệu trình</span>
        </div>
        {treatments.length === 0 && !isLoading && (
          <div className="rounded-2xl border border-botanical-border bg-white p-lg text-center text-body-sm text-sage-secondary">
            Không tìm thấy liệu trình nào phù hợp.
          </div>
        )}
        {treatments.length > 0 && (
          <div className="grid gap-md sm:grid-cols-2">
            {treatments.map((treatment) => (
              <button
                key={treatment.id}
                type="button"
                onClick={() => onSelectTreatment(treatment)}
                className={cn(
                  "rounded-2xl border p-md text-left transition-all",
                  selectedTreatment?.id === treatment.id
                    ? "border-primary bg-soft-mint shadow-sm"
                    : "border-botanical-border bg-white hover:border-primary hover:bg-soft-mint/40"
                )}
              >
                <div className="flex items-start gap-md">
                  {treatment.imageUrl ? (
                    <img src={treatment.imageUrl} alt={treatment.name} className="h-16 w-16 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gentle-wash">
                      <Sparkles className="h-6 w-6 text-sage-secondary" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-black text-ink-primary">{treatment.name}</h4>
                    <p className="mt-xs text-body-sm text-sage-secondary line-clamp-2">{treatment.description}</p>
                    <div className="mt-sm flex flex-wrap items-center gap-md text-label-caption text-on-surface-variant">
                      <Badge className="border-0 bg-gentle-wash text-sage-secondary">{treatment.category}</Badge>
                      <span>{treatment.durationMinutes} phut</span>
                      <span>*</span>
                      <span className="font-semibold text-primary">{Number(treatment.price).toLocaleString("vi-VN")}d</span>
                    </div>
                  </div>
                  {selectedTreatment?.id === treatment.id && (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
        {treatmentPageCount > 1 && (
          <div className="mt-lg flex items-center justify-center gap-sm">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(treatmentPage - 1)}
              disabled={treatmentPage <= 1}
              className="h-8 rounded-lg px-md text-sm"
            >
              Prev
            </Button>
            <span className="text-label-caption text-sage-secondary">
              Trang {treatmentPage} / {treatmentPageCount}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(treatmentPage + 1)}
              disabled={treatmentPage >= treatmentPageCount}
              className="h-8 rounded-lg px-md text-sm"
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Chi tiết treatment đã chọn */}
      <div className="grid gap-lg xl:grid-cols-[1.05fr_0.95fr]">
        <div className="overflow-hidden rounded-3xl border border-botanical-border bg-surface-container-lowest">
          {selectedTreatment.imageUrl ? (
            <img src={selectedTreatment.imageUrl} alt={selectedTreatment.name} className="h-64 w-full object-cover" />
          ) : (
            <div className="flex h-64 w-full items-center justify-center bg-gentle-wash">
              <Sparkles className="h-12 w-12 text-sage-secondary" />
            </div>
          )}
          <div className="p-xl">
            <Badge className="mb-md border-0 bg-soft-mint text-primary">{selectedTreatment.category}</Badge>
            <h3 className="text-2xl font-black text-ink-primary">{selectedTreatment.name}</h3>
            <p className="mt-sm text-body text-sage-secondary">{selectedTreatment.description}</p>
            <div className="mt-lg grid gap-md sm:grid-cols-2">
              <Metric icon={<Clock3 />} label="Thời lượng" value={`${selectedTreatment.durationMinutes} phút`} />
              <Metric icon={<CalendarDays />} label="Giá liệu trình" value={`${Number(selectedTreatment.price).toLocaleString("vi-VN")}đ`} />
            </div>
          </div>
        </div>

        <div className="space-y-lg">
          <div className="rounded-3xl border border-botanical-border bg-white p-xl shadow-sm">
            <div className="flex items-center gap-md">
              {selectedTherapist.portraitUrl ? (
                <img src={selectedTherapist.portraitUrl} alt={selectedTherapist.fullName} className="h-20 w-20 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-soft-mint text-primary">
                  <span className="text-2xl font-black">{selectedTherapist.fullName.charAt(0)}</span>
                </div>
              )}
              <div>
                <h3 className="text-h3 text-ink-primary">{selectedTherapist.fullName}</h3>
                <p className="text-body-sm text-sage-secondary">
                  {Array.isArray(selectedTherapist.specialties)
                    ? selectedTherapist.specialties.join(", ")
                    : selectedTherapist.specialties}
                </p>
                <div className="mt-xs flex items-center gap-xs text-label-caption font-semibold text-pending-amber">
                  <Star className="h-4 w-4 fill-pending-amber" /> {selectedTherapist.rating.toFixed(1)} · {selectedTherapist.completedBookings} lượt đặt
                </div>
              </div>
            </div>
            <div className="mt-lg grid gap-sm">
              {["Đã xác minh hồ sơ", `${selectedTherapist.yearsOfExperience} năm kinh nghiệm`, "Chuyên chăm sóc tại nhà ở Đà Nẵng"].map((item) => (
                <div key={item} className="flex items-center gap-sm text-body-sm text-on-surface-variant">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <StepActions nextLabel="Tiếp tục chọn thời gian" onNext={onNext} backLabel="Quay lại chi tiết liệu trình" />
    </StepCard>
  );
}

function TimeStep({
  selectedDate,
  selectedTimeSlot,
  availableSlots,
  isLoading,
  onSelectDate,
  onSelectTimeSlot,
  onBack,
  onNext,
}: {
  selectedDate: string | null;
  selectedTimeSlot: TimeSlot | null;
  availableSlots: TimeSlot[];
  isLoading: boolean;
  onSelectDate: (date: string) => void;
  onSelectTimeSlot: (slot: TimeSlot) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  // Generate next 7 days
  const dates = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      result.push(date.toISOString().split("T")[0]);
    }
    return result;
  }, []);

  const formatDateLabel = (isoDate: string) => {
    const date = new Date(isoDate);
    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return {
      day: dayNames[date.getDay()],
      date: date.getDate().toString(),
      month: `Th${date.getMonth() + 1}`,
    };
  };

  const groupedSlots = useMemo(() => {
    const morning = availableSlots.filter((s) => {
      const hour = parseInt(s.startTime.split(":")[0]);
      return hour >= 6 && hour < 12;
    });
    const afternoon = availableSlots.filter((s) => {
      const hour = parseInt(s.startTime.split(":")[0]);
      return hour >= 12 && hour < 18;
    });
    const evening = availableSlots.filter((s) => {
      const hour = parseInt(s.startTime.split(":")[0]);
      return hour >= 18;
    });
    return { morning, afternoon, evening };
  }, [availableSlots]);

  // Check if user has selected date and needs to see slots
  const shouldShowPrompt = !selectedDate;
  const shouldShowSlots = selectedDate && !isLoading;
  const hasNoSlots = shouldShowSlots && availableSlots.length === 0;

  return (
    <StepCard icon={<CalendarDays />} title="Chọn ngày và khung giờ" description="Các khung giờ còn trống được cập nhật theo lịch của kỹ thuật viên.">
      <section>
        <h3 className="mb-md text-sm font-black text-ink-primary">Ngày hẹn</h3>
        <div className="grid gap-sm sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7 2xl:gap-md">
          {dates.map((date) => {
            const label = formatDateLabel(date);
            const isSelected = selectedDate === date;
            return (
              <button
                key={date}
                type="button"
                onClick={() => onSelectDate(date)}
                className={cn(
                  "rounded-2xl border px-md py-sm text-center transition-all",
                  isSelected && "border-primary bg-soft-mint text-primary shadow-sm",
                  !isSelected && "border-botanical-border bg-white hover:border-primary hover:bg-soft-mint/50"
                )}
              >
                <span className="block text-label-caption font-semibold">{label.day}</span>
                <span className="block text-xl font-black">{label.date}</span>
                <span className="block text-label-caption">{label.month}</span>
              </button>
            );
          })}
        </div>
      </section>

      {shouldShowPrompt && (
        <div className="rounded-2xl bg-gentle-wash p-lg text-center text-body-sm text-sage-secondary">
          Bạn có thể thay đổi thời gian trước khi kỹ thuật viên xác nhận lịch hẹn.
        </div>
      )}

      {isLoading && (
        <div className="rounded-2xl bg-white p-lg">
          <LoadingState message="Đang tải khung giờ..." />
        </div>
      )}

      {hasNoSlots && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-lg text-center text-body-sm text-orange-900">
          <AlertCircle className="mx-auto mb-sm h-6 w-6" />
          <p className="font-semibold">Không có khung giờ trống cho ngày này</p>
          <p className="mt-xs text-body-sm opacity-75">Vui lòng chọn ngày khác hoặc thử lại sau.</p>
        </div>
      )}

      {shouldShowSlots && availableSlots.length > 0 && (
        <section className="space-y-lg">
          {groupedSlots.morning.length > 0 && (
            <SlotGroup title="Buổi sáng" slots={groupedSlots.morning} selectedSlot={selectedTimeSlot} onSelect={onSelectTimeSlot} />
          )}
          {groupedSlots.afternoon.length > 0 && (
            <SlotGroup title="Buổi chiều" slots={groupedSlots.afternoon} selectedSlot={selectedTimeSlot} onSelect={onSelectTimeSlot} />
          )}
          {groupedSlots.evening.length > 0 && (
            <SlotGroup title="Buổi tối" slots={groupedSlots.evening} selectedSlot={selectedTimeSlot} onSelect={onSelectTimeSlot} />
          )}
        </section>
      )}

      <StepActions backLabel="Quay lại" nextLabel="Tiếp tục" onBack={onBack} onNext={onNext} disabled={!selectedTimeSlot} />
    </StepCard>
  );
}

function SlotGroup({ title, slots, selectedSlot, onSelect }: { title: string; slots: TimeSlot[]; selectedSlot: TimeSlot | null; onSelect: (slot: TimeSlot) => void }) {
  return (
    <div>
      <h3 className="mb-md flex items-center gap-xs text-sm font-black text-ink-primary">
        <Clock3 className="h-4 w-4 text-primary" /> {title}
      </h3>
      <div className="grid gap-sm sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6">
        {slots.map((slot) => {
          const isSelected = selectedSlot?.id === slot.id;
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onSelect(slot)}
              className={cn(
                "rounded-full border px-md py-sm text-sm font-semibold transition-all",
                isSelected && "border-primary bg-primary text-on-primary shadow-md",
                !isSelected && "border-botanical-border bg-white text-foreground hover:border-primary hover:bg-soft-mint"
              )}
            >
              {slot.startTime}
              {isSelected ? " ✓" : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AddressStep({
  address,
  contactPhone,
  addressNote,
  bookingAddressImage,
  onSave,
  onBack,
}: {
  address: string;
  contactPhone: string;
  addressNote: string;
  bookingAddressImage: string;
  onSave: (address: string, phone: string, note: string, save: boolean) => void;
  onBack: () => void;
}) {
  const [localAddress, setLocalAddress] = useState(address || "");
  const [localPhone, setLocalPhone] = useState(contactPhone || "");
  const [localNote, setLocalNote] = useState(addressNote || "");
  const [saveAddress, setSaveAddress] = useState(Boolean(address || contactPhone || addressNote));

  const handleNext = () => {
    if (!localAddress.trim() || !localPhone.trim()) {
      alert("Vui lòng nhập đầy đủ địa chỉ và số điện thoại");
      return;
    }
    onSave(localAddress, localPhone, localNote, saveAddress);
  };

  return (
    <StepCard icon={<Home />} title="Địa chỉ & thông tin liên hệ" description="Thông tin này giúp kỹ thuật viên đến đúng nơi và chuẩn bị trước khi phục vụ.">
      <div className="grid gap-xl xl:grid-cols-[1fr_260px]">
        <div className="space-y-lg">
          <Field label="Địa chỉ phục vụ" helper="Ví dụ: 24 Nguyễn Văn Linh, Hải Châu, Đà Nẵng">
            <Input value={localAddress} onChange={(e) => setLocalAddress(e.target.value)} className="h-12 rounded-xl" placeholder="Nhập địa chỉ đầy đủ" />
          </Field>
          <Field label="Số điện thoại liên hệ">
            <Input value={localPhone} onChange={(e) => setLocalPhone(e.target.value)} className="h-12 rounded-xl" />
          </Field>
          <Field label="Ghi chú thêm cho kỹ thuật viên">
            <textarea
              value={localNote}
              onChange={(e) => setLocalNote(e.target.value)}
              className="min-h-32 w-full rounded-xl border border-border bg-card px-md py-sm text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
            />
          </Field>
          <label className="flex items-center gap-sm rounded-2xl border border-botanical-border bg-white p-lg text-body-sm font-semibold text-foreground">
            <input type="checkbox" className="h-4 w-4 accent-primary" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} /> Lưu địa chỉ này cho lần đặt lịch sau
          </label>
        </div>
        <div className="space-y-lg">
          <img src={bookingAddressImage} alt="Địa chỉ phục vụ tại nhà" className="h-48 w-full rounded-3xl object-cover" />
          <div className="rounded-3xl border border-botanical-border bg-soft-mint p-lg">
            <MapPin className="mb-sm h-6 w-6 text-primary" />
            <h3 className="text-h3 text-ink-primary">Khu vực phục vụ</h3>
            <p className="mt-xs text-body-sm text-on-surface-variant">JvJ hiện hỗ trợ đặt lịch tại khu vực Đà Nẵng.</p>
          </div>
        </div>
      </div>
      <StepActions backLabel="Quay lại" nextLabel="Tiếp tục khai báo sức khỏe" onBack={onBack} onNext={handleNext} />
    </StepCard>
  );
}

function HealthStep({
  healthInfo,
  onSave,
  onBack,
}: {
  healthInfo: { conditions: string[]; notes: string };
  onSave: (info: { conditions: string[]; notes: string }) => void;
  onBack: () => void;
}) {
  const [selectedConditions, setSelectedConditions] = useState<string[]>(healthInfo.conditions || []);
  const [notes, setNotes] = useState(healthInfo.notes || "");

  const toggleCondition = (condition: string) => {
    setSelectedConditions((prev) => (prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]));
  };

  const handleNext = () => {
    onSave({ conditions: selectedConditions, notes });
  };

  return (
    <StepCard icon={<HeartPulse />} title="Khai báo sức khỏe" description="Chia sẻ một vài thông tin cần lưu ý để buổi trị liệu an toàn và phù hợp hơn.">
      <div>
        <h3 className="mb-md text-h3 text-ink-primary">Bạn có tình trạng nào cần kỹ thuật viên lưu ý không?</h3>
        <div className="grid gap-md md:grid-cols-2">
          {healthOptions.map((option) => (
            <label key={option} className="flex cursor-pointer items-center gap-md rounded-2xl border border-botanical-border bg-white p-lg transition-all hover:border-primary hover:bg-soft-mint/40">
              <input type="checkbox" checked={selectedConditions.includes(option)} onChange={() => toggleCondition(option)} className="h-4 w-4 accent-primary" />
              <span className="text-body-sm font-semibold text-foreground">{option}</span>
            </label>
          ))}
        </div>
      </div>
      <Field label="Ghi chú sức khỏe cho kỹ thuật viên">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-32 w-full rounded-xl border border-border bg-card px-md py-sm text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
          placeholder="Ví dụ: Đau vùng cổ vai gáy sau khi ngồi làm việc lâu, không dị ứng dầu xoa bóp."
        />
      </Field>
      <div className="rounded-3xl border border-orange-200 bg-orange-50 p-lg text-body-sm text-orange-900">
        <div className="mb-xs flex items-center gap-sm font-black">
          <AlertCircle className="h-5 w-5" /> Lưu ý an toàn
        </div>
        Nếu bạn có triệu chứng nghiêm trọng, đau dữ dội, sốt cao hoặc chấn thương mới, hãy tham khảo ý kiến bác sĩ trước khi đặt lịch.
      </div>
      <StepActions backLabel="Quay lại" nextLabel="Xem lại & xác nhận" onBack={onBack} onNext={handleNext} />
    </StepCard>
  );
}

function ConfirmStep({
  selectedTreatment,
  selectedTherapist,
  selectedTimeSlot,
  address,
  contactPhone,
  healthInfo,
  createdBooking,
  isCreating,
  selectedSpaName,
  onBack,
  onCreate,
  onViewBooking,
}: {
  selectedTreatment: Treatment;
  selectedTherapist: Therapist;
  selectedTimeSlot: TimeSlot;
  address: string;
  contactPhone: string;
  healthInfo: { conditions: string[]; notes: string };
  createdBooking: Booking | null;
  isCreating: boolean;
  selectedSpaName?: string;
  onBack: () => void;
  onCreate: () => void;
  onViewBooking: () => void;
}) {
  const [agreed, setAgreed] = useState(false);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <StepCard icon={<ShieldCheck />} title={createdBooking ? "Đặt lịch thành công" : "Xác nhận lịch hẹn"} description={createdBooking ? "Booking của bạn đã được tạo và đang chờ xác nhận." : "Vui lòng kiểm tra lại thông tin trước khi gửi yêu cầu đặt lịch."}>
      {createdBooking && (
        <div className="mb-lg rounded-3xl border border-emerald-200 bg-emerald-50 p-lg">
          <div className="flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Badge className="mb-md border-0 bg-amber-100 text-amber-700">Chờ xác nhận</Badge>
              <h3 className="text-xl font-black text-ink-primary">Đã gửi yêu cầu đặt lịch</h3>
              <p className="mt-xs text-body-sm text-on-surface-variant">JvJ sẽ xác nhận lịch hẹn và thông báo cho bạn trong thời gian sớm nhất.</p>
              <p className="mt-sm text-sm font-black text-primary">Mã lịch hẹn: {createdBooking.code}</p>
            </div>
            <CheckCircle2 className="h-16 w-16 text-success-leaf" />
          </div>
          <div className="mt-lg flex flex-col gap-md sm:flex-row">
            <Button onClick={onViewBooking} className="flex-1 rounded-xl shadow-md">
              Xem chi tiết lịch hẹn
            </Button>
            <Button variant="secondary" onClick={() => {
              useBookingWizardStore.getState().reset();
              useBookingWizardStore.getState().loadTreatments({ page: 1 });
              useBookingWizardStore.getState().loadTherapists();
            }} className="flex-1 rounded-xl">
              Đặt lịch khác
            </Button>
          </div>
        </div>
      )}
      <div className="grid gap-lg md:grid-cols-2">
        <ConfirmBlock
          title="Liệu trình"
          items={[selectedTreatment?.name || "Chưa chọn", `${selectedTreatment?.durationMinutes} phút` || "", `${Number(selectedTreatment?.price || 0).toLocaleString("vi-VN")}đ`]}
        />
        <ConfirmBlock
          title="Kỹ thuật viên"
          items={[
            selectedTherapist?.fullName || "Chưa chọn",
            selectedTherapist?.specialties || "",
            `${selectedTherapist?.rating} sao · ${selectedTherapist?.completedBookings} lượt đặt`,
          ]}
        />
        <ConfirmBlock
          title="Thời gian"
          items={[selectedTimeSlot ? formatDate(selectedTimeSlot.date) : "Chưa chọn", selectedTimeSlot ? `${selectedTimeSlot.startTime} - ${selectedTimeSlot.endTime}` : ""]}
        />
        <ConfirmBlock title="Địa chỉ" items={[address || "Chưa nhập", contactPhone || "Chưa nhập"]} />
        {selectedSpaName ? <ConfirmBlock title="Spa đối tác" items={[selectedSpaName, "Đã giữ context từ trang spa"]} /> : null}
      </div>
      <div className="rounded-3xl border border-botanical-border bg-white p-xl">
        <h3 className="text-h3 text-ink-primary">Lưu ý sức khỏe</h3>
        <div className="mt-md flex flex-wrap gap-sm">
          {healthInfo.conditions.length > 0 ? (
            healthInfo.conditions.map((item) => (
              <span key={item} className="rounded-full bg-soft-mint px-md py-sm text-body-sm font-semibold text-primary">
                {item}
              </span>
            ))
          ) : (
            <span className="text-body-sm text-sage-secondary">Không có tình trạng đặc biệt</span>
          )}
        </div>
        {healthInfo.notes && <p className="mt-md text-body-sm text-on-surface-variant">{healthInfo.notes}</p>}
      </div>
      <div className="rounded-3xl border border-botanical-border bg-gentle-wash p-xl">
        <div className="flex flex-col gap-lg sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-h3 text-ink-primary">Thanh toán</h3>
            <p className="mt-xs text-body-sm text-on-surface-variant">Bạn chỉ thanh toán sau khi lịch hẹn được xác nhận.</p>
          </div>
          <div className="text-3xl font-black text-primary">{Number(selectedTreatment?.price || 0).toLocaleString("vi-VN")}đ</div>
        </div>
      </div>
      {!createdBooking && (
        <>
          <label className="flex items-start gap-md rounded-2xl border border-botanical-border bg-white p-lg text-body-sm text-on-surface-variant">
            <input type="checkbox" className="mt-1 h-4 w-4 accent-primary" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            Tôi xác nhận thông tin trên là chính xác và đồng ý để JvJ liên hệ xác nhận lịch hẹn.
          </label>
          <div className="flex gap-md">
            <Button variant="secondary" onClick={onBack} className="flex-1 rounded-xl">
              <ArrowLeft className="mr-xs h-4 w-4" /> Quay lại chỉnh sửa
            </Button>
            <Button onClick={onCreate} disabled={!agreed || isCreating} className="flex-1 rounded-xl shadow-md">
              {isCreating ? "Đang tạo..." : "Xác nhận đặt lịch"} <ArrowRight className="ml-xs h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </StepCard>
  );
}

function BookingSummary({
  currentStep,
  selectedTreatment,
  selectedTherapist,
  selectedTimeSlot,
  address,
  selectedSpa,
}: {
  currentStep: number;
  selectedTreatment: Treatment | null;
  selectedTherapist: Therapist | null;
  selectedTimeSlot: TimeSlot | null;
  address: string;
  selectedSpa: Spa | null;
}) {
  return (
    <Card className="overflow-hidden rounded-3xl border-botanical-border bg-white shadow-stitch-soft">
      <div className="bg-gentle-wash p-xl">
        <h2 className="text-h2 text-ink-primary">Tóm tắt đặt lịch</h2>
      </div>
      <div className="space-y-lg p-xl">
        {selectedTreatment && (
          <SummaryRow label="Liệu trình" value={selectedTreatment.name} sublabel={`${Number(selectedTreatment.price).toLocaleString("vi-VN")}đ`} />
        )}
        {selectedTherapist && <SummaryRow label="Kỹ thuật viên" value={selectedTherapist.fullName} sublabel={`${selectedTherapist.rating} sao`} />}
        {selectedTimeSlot && (
          <SummaryRow
            label="Thời gian"
            value={new Date(selectedTimeSlot.date).toLocaleDateString("vi-VN")}
            sublabel={`${selectedTimeSlot.startTime} - ${selectedTimeSlot.endTime}`}
          />
        )}
        {address && <SummaryRow label="Địa chỉ" value={address} />}
        {selectedSpa && <SummaryRow label="Spa đối tác" value={selectedSpa.name} sublabel={selectedSpa.district} />}
        {currentStep >= 5 && selectedTreatment && (
          <div className="border-t border-botanical-border pt-lg">
            <div className="flex items-center justify-between">
              <span className="text-body-sm font-bold text-sage-secondary">Tổng thanh toán</span>
              <span className="text-2xl font-black text-primary">{Number(selectedTreatment.price).toLocaleString("vi-VN")}đ</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function SummaryRow({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <div>
      <span className="block text-label-caption font-semibold text-sage-secondary">{label}</span>
      <span className="mt-xs block text-body font-bold text-ink-primary">{value}</span>
      {sublabel && <span className="mt-xs block text-body-sm text-on-surface-variant">{sublabel}</span>}
    </div>
  );
}

function StepCard({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="space-y-xl rounded-3xl border-botanical-border bg-white p-xl shadow-stitch-soft">
      <div>
        <div className="mb-md flex h-12 w-12 items-center justify-center rounded-2xl bg-soft-mint text-primary">{icon}</div>
        <h2 className="text-h2 text-ink-primary">{title}</h2>
        <p className="mt-xs text-body-sm text-sage-secondary">{description}</p>
      </div>
      {children}
    </Card>
  );
}

function StepActions({
  backLabel,
  nextLabel,
  onBack,
  onNext,
  disabled,
}: {
  backLabel?: string;
  nextLabel?: string;
  onBack?: () => void;
  onNext?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-md">
      {onBack && (
        <Button variant="secondary" onClick={onBack} className="flex-1 rounded-xl">
          <ArrowLeft className="mr-xs h-4 w-4" /> {backLabel || "Quay lại"}
        </Button>
      )}
      {onNext && (
        <Button onClick={onNext} disabled={disabled} className="flex-1 rounded-xl shadow-md">
          {nextLabel || "Tiếp tục"} <ArrowRight className="ml-xs h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-xs block text-sm font-bold text-ink-primary">{label}</label>
      {helper && <p className="mb-sm text-body-sm text-sage-secondary">{helper}</p>}
      {children}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-md rounded-2xl border border-botanical-border bg-gentle-wash p-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary">{icon}</div>
      <div>
        <span className="block text-label-caption font-semibold text-sage-secondary">{label}</span>
        <span className="block text-body font-black text-ink-primary">{value}</span>
      </div>
    </div>
  );
}

function ConfirmBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-botanical-border bg-white p-lg">
      <h3 className="mb-md text-sm font-black uppercase tracking-wide text-sage-secondary">{title}</h3>
      {items.filter(Boolean).map((item, idx) => (
        <p key={idx} className={cn("text-body-sm", idx === 0 ? "font-bold text-ink-primary" : "text-on-surface-variant")}>
          {item}
        </p>
      ))}
    </div>
  );
}
