import { useEffect } from "react";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PaymentMockPanel } from "@/features/payments/components/PaymentMockPanel";
import { PaymentStatusCard } from "@/features/payments/components/PaymentStatusCard";
import { PaymentSummaryCard } from "@/features/payments/components/PaymentSummaryCard";
import { usePaymentStore } from "@/features/payments/stores/payment-store";

export function CustomerPaymentPage() {
  const { bookingId = "" } = useParams();
  const {
    booking,
    payment,
    isLoading,
    error,
    actionMessage,
    loadBooking,
    initiatePayment,
    simulatePaymentSuccess,
    simulatePaymentFailed,
    retryPayment,
  } = usePaymentStore();

  useEffect(() => {
    void loadBooking(bookingId);
  }, [bookingId, loadBooking]);

  if (isLoading && !booking) {
    return <LoadingSkeleton variant="card" count={2} />;
  }

  if (!booking) {
    return (
      <Card className="rounded-2xl border-[#bdc9c6] bg-white p-12 text-center shadow-[0_4px_20px_rgba(15,118,110,0.04)]">
        <CalendarDays className="mx-auto mb-4 h-12 w-12 text-[#6e7977]" />
        <h1 className="mb-2 text-2xl font-bold text-[#181c1c]">Không tìm thấy booking</h1>
        <p className="mb-6 text-[#3e4947]">Rất tiếc, thông tin lịch hẹn này không tồn tại hoặc đã hết hạn.</p>
        <Link
          to="/app/appointments"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-[#005c55] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#0f766e]"
        >
          Quay lại lịch hẹn
        </Link>
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] pb-12 text-[#181c1c]">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm">
        <Link to="/app/appointments" className="inline-flex items-center gap-1 font-medium text-[#005c55] transition-colors hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Quay lại lịch hẹn
        </Link>
        <span className="text-[#6e7977]">/</span>
        <Link to={`/app/appointments/${booking.id}`} className="text-[#3e4947] transition-colors hover:text-[#005c55] hover:underline">
          {booking.code}
        </Link>
        <span className="text-[#6e7977]">/</span>
        <span className="text-[#3e4947]">Thanh toán</span>
      </nav>

      <section className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#181c1c]">Thanh toán lịch hẹn</h1>
        <p className="mt-2 max-w-2xl text-[#3e4947]">Hoàn tất thanh toán demo cho lịch hẹn của bạn trước khi JvJ ghi nhận trạng thái giao dịch trên hệ thống.</p>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <PaymentSummaryCard booking={booking} />
          <PaymentStatusCard paymentStatus={booking.paymentStatus} actionMessage={actionMessage} />
        </div>

        <div className="lg:col-span-7">
          <PaymentMockPanel
            booking={booking}
            isLoading={isLoading}
            hasPayment={!!payment}
            onInitiatePayment={() => initiatePayment(bookingId)}
            onSimulateSuccess={() => simulatePaymentSuccess(bookingId)}
            onSimulateFailed={() => simulatePaymentFailed(bookingId)}
            onRetryPayment={() => retryPayment(bookingId)}
          />
        </div>
      </div>
    </div>
  );
}
