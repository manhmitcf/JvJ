import { MapPin, MessageSquare } from "lucide-react";
import { type Booking } from "@/types/booking";
import { StatusBadge } from "./shared";

export function BookingDetailDrawer({ booking, image, customerName, treatmentName }: { booking: Booking | undefined; image: string; customerName: string; treatmentName: string }) {
  if (!booking) return null;

  return (
    <aside className="rounded-[2rem] border border-botanical-border bg-white p-lg shadow-stitch-soft xl:sticky xl:top-24 xl:self-start">
      <img src={image} alt="Chi tiết booking" className="h-44 w-full rounded-3xl object-cover" />
      <div className="mt-lg">
        <StatusBadge tone="amber">Chờ xác nhận</StatusBadge>
        <h2 className="mt-sm text-2xl font-black text-ink-primary">{booking.code}</h2>
        <p className="mt-xs text-body-sm font-semibold text-sage-secondary">{customerName} · {treatmentName}</p>
      </div>
      <div className="mt-lg space-y-sm text-body-sm font-semibold text-sage-secondary">
        <p className="flex items-center gap-sm"><MapPin className="h-4 w-4 text-primary" /> {booking.address}</p>
        <p className="flex items-center gap-sm"><MessageSquare className="h-4 w-4 text-primary" /> {booking.note ?? "Khách muốn được tư vấn kỹ trước buổi trị liệu."}</p>
      </div>
    </aside>
  );
}
