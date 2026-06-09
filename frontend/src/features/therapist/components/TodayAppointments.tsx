import { Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { type TodayAppointment } from "../services/dashboard-service";
import { SecondaryButton, StatusBadge } from "./shared";

export function TodayAppointments({
  appointments,
  images,
}: {
  appointments: TodayAppointment[];
  images: string[];
}) {
  return (
    <section className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft">
      <div className="mb-lg flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-ink-primary">Lịch hẹn hôm nay</h2>
          <p className="text-body-sm font-medium text-sage-secondary">Các lịch cần theo dõi và xác nhận.</p>
        </div>
        <Link to="/therapist/bookings" className="text-body-sm font-black text-primary">Xem tất cả</Link>
      </div>
      <div className="space-y-md">
        {appointments.length === 0 ? (
          <p className="py-lg text-center text-body-md font-medium text-sage-secondary">Chưa có lịch hẹn nào hôm nay.</p>
        ) : (
          appointments.map((booking, index) => (
            <div key={booking.id} className="flex flex-col gap-md rounded-3xl border border-botanical-border bg-warm-bg p-md md:flex-row md:items-center">
              <img src={images[index] ?? images[0]} alt={booking.customerName} className="h-16 w-16 rounded-2xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-sm">
                  <h3 className="font-black text-ink-primary">{booking.customerName}</h3>
                  <StatusBadge tone={statusTone(booking.status)}>{statusLabel(booking.status)}</StatusBadge>
                </div>
                <p className="mt-xs truncate text-body-sm font-semibold text-sage-secondary">{booking.treatmentName}</p>
                <div className="mt-xs flex flex-wrap gap-md text-label-caption font-bold text-muted-text">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {booking.startTime}–{booking.endTime}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {booking.address}</span>
                </div>
              </div>
              <SecondaryButton>Xem chi tiết</SecondaryButton>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function statusTone(status: string): "teal" | "green" | "amber" | "blue" | "red" | "slate" {
  if (status === "pending") return "amber";
  if (status === "confirmed" || status === "in_progress") return "teal";
  if (status === "completed") return "blue";
  if (status === "rejected") return "red";
  return "slate";
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    in_progress: "Đang thực hiện",
    completed: "Hoàn tất",
    rejected: "Đã từ chối",
    cancelled: "Đã hủy",
  };
  return labels[status] ?? status;
}
