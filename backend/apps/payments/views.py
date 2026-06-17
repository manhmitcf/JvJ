"""Payment views: initiate, simulate, refund, timeline."""
import logging

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.bookings.models import Booking

from .models import Payment, PaymentTimeline
from .serializers import PaymentSerializer, PaymentTimelineSerializer
from .vnpay_mock import VNPAYSimulator

logger = logging.getLogger(__name__)


def _send_payment_notification(payment, new_status, old_status):
    """Explicitly send notification when payment status changes.
    
    This is a fallback mechanism to ensure notifications are sent even if
    Django signals don't fire properly.
    """
    from apps.notifications.models import Notification
    
    if new_status == "success":
        # Notify customer of successful payment
        Notification.objects.create(
            recipient=payment.booking.customer,
            notification_type="payment_success",
            title=f"Thanh toán cho lịch hẹn **{payment.booking.code}** thành công",
            message=f"Số tiền {payment.amount:,.0f}đ đã được thanh toán",
            data={"booking_id": str(payment.booking.id), "payment_id": str(payment.id)},
        )
        logger.info(f"[PAYMENT-FALLBACK] Created payment_success for customer {payment.booking.customer_id}")
        
        # Notify therapist that customer has paid
        Notification.objects.create(
            recipient=payment.booking.therapist,
            notification_type="payment_success",
            title=f"Khách hàng **{payment.booking.customer.full_name}** đã thanh toán cho lịch hẹn **{payment.booking.code}**",
            message=f"Số tiền {payment.amount:,.0f}đ đã được thanh toán thành công",
            data={"booking_id": str(payment.booking.id), "payment_id": str(payment.id)},
        )
        logger.info(f"[PAYMENT-FALLBACK] Created payment_success for therapist {payment.booking.therapist_id}")
    
    elif new_status == "failed":
        Notification.objects.create(
            recipient=payment.booking.customer,
            notification_type="payment_failed",
            title=f"Thanh toán cho lịch hẹn **{payment.booking.code}** thất bại",
            message=f"Vui lòng thử lại thanh toán {payment.amount:,.0f}đ",
            data={"booking_id": str(payment.booking.id), "payment_id": str(payment.id)},
        )
        logger.info(f"[PAYMENT-FALLBACK] Created payment_failed for customer {payment.booking.customer_id}")
    
    elif new_status == "refunded":
        Notification.objects.create(
            recipient=payment.booking.customer,
            notification_type="payment_refunded",
            title=f"Thanh toán lịch hẹn **{payment.booking.code}** đã hoàn tiền",
            message=f"Số tiền {payment.amount:,.0f}đ đã được hoàn về tài khoản",
            data={"booking_id": str(payment.booking.id), "payment_id": str(payment.id)},
        )
        logger.info(f"[PAYMENT-FALLBACK] Created payment_refunded for customer {payment.booking.customer_id}")
        
        Notification.objects.create(
            recipient=payment.booking.therapist,
            notification_type="payment_refunded",
            title=f"Thanh toán lịch hẹn **{payment.booking.code}** đã hoàn tiền",
            message=f"Số tiền {payment.amount:,.0f}đ đã được hoàn về tài khoản khách hàng",
            data={"booking_id": str(payment.booking.id), "payment_id": str(payment.id)},
        )
        logger.info(f"[PAYMENT-FALLBACK] Created payment_refunded for therapist {payment.booking.therapist_id}")


class PaymentInitiateView(APIView):
    """POST /api/v1/payments/:booking_id/initiate/ — Tạo yêu cầu thanh toán."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id, customer=request.user)
        except Booking.DoesNotExist:
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Không tìm thấy booking"}},
                status=status.HTTP_404_NOT_FOUND,
            )

        if booking.status not in ("pending", "confirmed"):
            return Response(
                {"error": {"code": "INVALID_STATUS", "message": "Chỉ có thể thanh toán booking pending hoặc confirmed"}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if hasattr(booking, "payment"):
            return Response(
                {"data": PaymentSerializer(booking.payment).data},
                status=status.HTTP_200_OK,
            )

        method = request.data.get("method", "vnpay_qr")
        if method not in ["vnpay_qr", "vnpay_card"]:
            return Response(
                {"error": {"code": "INVALID_METHOD", "message": "Phương thức thanh toán không hợp lệ"}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment = Payment.objects.create(
            booking=booking,
            method=method,
            amount=booking.total_amount,
        )

        PaymentTimeline.objects.create(
            payment=payment,
            label=f"Khởi tạo thanh toán qua {method}",
            tone="neutral",
        )

        payment_url_data = VNPAYSimulator.generate_payment_url(payment)

        return Response(
            {
                "data": {
                    **PaymentSerializer(payment).data,
                    **payment_url_data,
                }
            },
            status=status.HTTP_201_CREATED,
        )


class PaymentDetailView(APIView):
    """GET /api/v1/payments/:booking_id/ — Xem trạng thái thanh toán."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Không tìm thấy booking"}},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.user.role != "admin" and booking.customer_id != request.user.id:
            return Response(
                {"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền xem thanh toán này"}},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not hasattr(booking, "payment"):
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Chưa có thanh toán cho booking này"}},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {"data": PaymentSerializer(booking.payment).data},
            status=status.HTTP_200_OK,
        )


class PaymentTimelineView(APIView):
    """GET /api/v1/payments/:booking_id/timeline/ — Xem payment timeline."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Không tìm thấy booking"}},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.user.role != "admin" and booking.customer_id != request.user.id:
            return Response(
                {"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền xem timeline"}},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not hasattr(booking, "payment"):
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Chưa có thanh toán"}},
                status=status.HTTP_404_NOT_FOUND,
            )

        timeline = booking.payment.timeline.all()
        return Response(
            {"data": PaymentTimelineSerializer(timeline, many=True).data},
            status=status.HTTP_200_OK,
        )


class PaymentSimulateView(APIView):
    """POST /api/v1/payments/:booking_id/simulate/ — Mock VNPAY callback (dev/testing)."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Không tìm thấy booking"}},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not hasattr(booking, "payment"):
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Chưa có payment"}},
                status=status.HTTP_404_NOT_FOUND,
            )

        payment = booking.payment
        old_status = payment.status
        success = request.data.get("success", True)

        callback = VNPAYSimulator.simulate_callback(success=success)

        if callback["success"]:
            payment.mark_success(callback["vnp_TransactionNo"])
            PaymentTimeline.objects.create(
                payment=payment,
                label="Thanh toán thành công qua VNPAY",
                tone="success",
            )
            booking.payment_status = "paid"
            booking.save(update_fields=["payment_status", "updated_at"])
            
            # Explicitly send notification (fallback for signal)
            _send_payment_notification(payment, payment.status, old_status)
        else:
            payment.mark_failed(callback["vnp_ResponseCode"])
            PaymentTimeline.objects.create(
                payment=payment,
                label=f"Thanh toán thất bại (mã: {callback['vnp_ResponseCode']})",
                tone="warning",
            )
            booking.payment_status = "failed"
            booking.save(update_fields=["payment_status", "updated_at"])
            
            # Explicitly send notification (fallback for signal)
            _send_payment_notification(payment, payment.status, old_status)

        return Response(
            {
                "data": {
                    **PaymentSerializer(payment).data,
                    "callback": callback,
                }
            },
            status=status.HTTP_200_OK,
        )


class PaymentRefundView(APIView):
    """POST /api/v1/payments/:booking_id/refund/ — Hoàn tiền (admin/therapist)."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, booking_id):
        if request.user.role not in ("admin", "therapist"):
            return Response(
                {"error": {"code": "FORBIDDEN", "message": "Chỉ admin hoặc therapist được hoàn tiền"}},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Không tìm thấy booking"}},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not hasattr(booking, "payment"):
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Chưa có payment"}},
                status=status.HTTP_404_NOT_FOUND,
            )

        payment = booking.payment
        old_status = payment.status
        if payment.status != "success":
            return Response(
                {"error": {"code": "INVALID_STATUS", "message": "Chỉ hoàn tiền cho payment thành công"}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        refund_result = VNPAYSimulator.simulate_refund()

        # Use correct status "refunded" to trigger notification signal
        payment.status = "refunded"
        payment.vnpay_response_code = "REFUND"
        payment.save(update_fields=["status", "vnpay_response_code"])

        booking.payment_status = "unpaid"
        booking.save(update_fields=["payment_status", "updated_at"])

        PaymentTimeline.objects.create(
            payment=payment,
            label=f"Hoàn tiền qua VNPAY ({refund_result['vnp_TransactionNo']})",
            tone="warning",
        )

        # Explicitly send notification (fallback for signal)
        _send_payment_notification(payment, payment.status, old_status)

        return Response(
            {"data": PaymentSerializer(payment).data},
            status=status.HTTP_200_OK,
        )
