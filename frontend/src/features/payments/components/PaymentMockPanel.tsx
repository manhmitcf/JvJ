import { AlertTriangle, CheckCircle2, QrCode, RotateCcw, ShieldCheck, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type Booking } from "@/types/booking";
import { cn } from "@/utils/cn";

export interface PaymentMockPanelProps {
  readonly booking: Booking;
  readonly isLoading: boolean;
  readonly hasPayment: boolean;
  readonly onInitiatePayment: () => Promise<void> | void;
  readonly onSimulateSuccess: () => Promise<void> | void;
  readonly onSimulateFailed: () => Promise<void> | void;
  readonly onRetryPayment: () => Promise<void> | void;
}

function formatCurrency(amount: number) {
  return amount.toLocaleString("vi-VN") + "đ";
}

function MockQrBlock() {
  return (
    <div className="rounded-[1.75rem] bg-[#ebefed] p-5">
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="grid grid-cols-8 gap-1 rounded-xl bg-white p-1">
          {Array.from({ length: 64 }, (_, index) => {
            const activeCells = new Set([
              0, 1, 2, 5, 6, 7, 8, 10, 13, 15, 16, 17, 18, 21, 22, 23, 24, 27, 28, 31,
              32, 34, 37, 39, 40, 42, 45, 47, 48, 49, 50, 53, 54, 55, 57, 58, 61, 62,
            ]);
            return <div key={index} className={cn("aspect-square rounded-[2px]", activeCells.has(index) ? "bg-[#0f172a]" : "bg-transparent")} />;
          })}
        </div>
      </div>
    </div>
  );
}

function PaymentInstructions({ booking }: { readonly booking: Booking }) {
  return (
    <div className="w-full max-w-sm space-y-4">
      {[
        "Quét mã QR demo bằng ứng dụng ngân hàng hoặc ví mô phỏng của Anh Mạnh.",
        `Kiểm tra mã booking ${booking.code} và số tiền ${formatCurrency(booking.totalAmount)}.`,
        "Bấm nút tương ứng bên dưới để mô phỏng kết quả thanh toán trên hệ thống JvJ.",
      ].map((text, index) => (
        <div key={text} className="flex items-start gap-4">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#005c55] text-xs font-bold text-white">{index + 1}</div>
          <p className="text-sm leading-6 text-[#3e4947]">{text}</p>
        </div>
      ))}
    </div>
  );
}

function PaymentSuccessState({ booking }: { readonly booking: Booking }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-700">
        <CheckCircle2 className="h-10 w-10" />
      </div>
      <h3 className="text-2xl font-bold text-[#181c1c]">Thanh toán thành công</h3>
      <p className="mt-3 max-w-sm text-sm leading-6 text-[#3e4947]">JvJ đã ghi nhận giao dịch demo cho {booking.code}. Bạn có thể quay lại chi tiết lịch hẹn để tiếp tục theo dõi.</p>
      <div className="mt-6 w-full rounded-2xl border border-[#bdc9c6] bg-[#f7faf8] p-4 text-left">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-[#3e4947]">Trạng thái</span>
          <span className="font-semibold text-green-700">Đã thanh toán</span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-4 text-sm">
          <span className="text-[#3e4947]">Tổng cộng</span>
          <span className="font-semibold text-[#181c1c]">{formatCurrency(booking.totalAmount)}</span>
        </div>
      </div>
      <Link
        to={`/app/appointments/${booking.id}`}
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#005c55] text-base font-bold text-white transition-colors hover:bg-[#0f766e]"
      >
        Quay lại chi tiết lịch hẹn
      </Link>
    </div>
  );
}

function PaymentFailedState({ booking, onRetryPayment, isLoading }: { readonly booking: Booking; readonly onRetryPayment: () => Promise<void> | void; readonly isLoading: boolean }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-700">
        <AlertTriangle className="h-10 w-10" />
      </div>
      <h3 className="text-2xl font-bold text-[#181c1c]">Thanh toán thất bại</h3>
      <p className="mt-3 max-w-sm text-sm leading-6 text-[#3e4947]">Giao dịch demo chưa thành công. Bạn có thể đưa booking về trạng thái chờ thanh toán để quét mã lại.</p>
      <div className="mt-6 w-full space-y-3">
        <Button onClick={onRetryPayment} disabled={isLoading} className="h-12 w-full rounded-xl bg-[#005c55] text-base font-bold hover:bg-[#0f766e]">
          <RotateCcw className="mr-2 h-4 w-4" />
          {isLoading ? "Đang xử lý..." : "Thử lại"}
        </Button>
        <Link
          to={`/app/appointments/${booking.id}`}
          className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-[#bdc9c6] bg-white text-sm font-semibold text-[#181c1c] transition-colors hover:bg-[#f1f4f3]"
        >
          Quay lại chi tiết lịch hẹn
        </Link>
      </div>
    </div>
  );
}

export function PaymentMockPanel({ booking, isLoading, hasPayment, onInitiatePayment, onSimulateSuccess, onSimulateFailed, onRetryPayment }: PaymentMockPanelProps) {
  const isPaid = booking.paymentStatus === "paid";
  const isFailed = booking.paymentStatus === "failed";
  const isPending = booking.paymentStatus === "unpaid";

  return (
    <Card className="rounded-2xl border-[#bdc9c6] bg-white p-8 shadow-[0_10px_30px_rgba(15,118,110,0.08)]">
      {isPaid ? (
        <PaymentSuccessState booking={booking} />
      ) : isFailed ? (
        <PaymentFailedState booking={booking} onRetryPayment={onRetryPayment} isLoading={isLoading} />
      ) : (
        <div className="flex flex-col items-center">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-800">
              <Wallet className="h-4 w-4" />
              Cổng thanh toán VNPAY (Mock)
            </div>
            <h3 className="text-2xl font-bold text-[#181c1c]">Quét mã QR để thanh toán</h3>
            <p className="mt-2 text-sm text-[#3e4947]">Mô phỏng thanh toán booking bằng QR/VNPAY trong môi trường demo của JvJ.</p>
          </div>

          <div className="relative mb-8 w-full max-w-[320px]">
            <MockQrBlock />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-[#005c55] shadow-sm backdrop-blur">
                <span className="inline-flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  QR mô phỏng
                </span>
              </div>
            </div>
          </div>

          <PaymentInstructions booking={booking} />

          <div className="mt-8 w-full space-y-3">
            {!hasPayment && isPending ? (
              <Button onClick={onInitiatePayment} disabled={isLoading} className="h-14 w-full rounded-xl bg-[#005c55] text-base font-bold hover:bg-[#0f766e]">
                <Wallet className="mr-2 h-5 w-5" />
                {isLoading ? "Đang khởi tạo..." : "Khởi tạo thanh toán"}
              </Button>
            ) : (
              <>
                <Button onClick={onSimulateSuccess} disabled={isLoading} className="h-14 w-full rounded-xl bg-[#005c55] text-base font-bold hover:bg-[#0f766e]">
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  {isLoading ? "Đang xử lý..." : "Giả lập thanh toán thành công"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={onSimulateFailed}
                  disabled={isLoading}
                  className="h-14 w-full rounded-xl border-2 border-red-700 bg-white text-base font-bold text-red-700 hover:bg-red-50"
                >
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Giả lập thanh toán thất bại
                </Button>
              </>
            )}
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#bdc9c6] bg-[#f1f4f3] p-4 text-left">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#005c55]" />
            <p className="text-xs leading-6 text-[#3e4947]">⚠️ Môi trường thử nghiệm - Thanh toán giả lập. Đây là môi trường demo, chưa kết nối cổng thanh toán thật. Dữ liệu chỉ dùng để kiểm thử luồng giao dịch trong JvJ.</p>
          </div>
        </div>
      )}
    </Card>
  );
}
