"""Notification signals."""
import logging

from django.db.models.signals import post_save
from django.dispatch import Signal, receiver

from apps.bookings.models import Booking
from apps.notifications.models import Notification
from apps.payments.models import Payment
from apps.therapists.models import TherapistProfile

logger = logging.getLogger(__name__)

# Explicit signal for booking status changes (backup if post_save doesn't fire)
booking_status_changed = Signal()  # Will be sent manually when booking status changes


def _get_previous_status(model_class, instance):
    if not instance.pk:
        return None
    try:
        return model_class.objects.only("status").get(pk=instance.pk).status
    except model_class.DoesNotExist:
        return None


def create_booking_notifications(booking, previous_status=None, created=False):
    """Create notifications for booking events.
    
    This function can be called directly or via signals.
    Args:
        booking: The Booking instance
        previous_status: Previous status (auto-fetched if not provided)
        created: Whether this is a new booking
    """
    logger.info(f"[NOTIFICATION] Creating booking notification: created={created}, status={booking.status}")

    if created:
        Notification.objects.create(
            recipient=booking.therapist,
            notification_type="booking_created",
            title=f"Bạn có lịch hẹn mới từ **{booking.customer.full_name}**",
            message=f"Lịch hẹn {booking.code} — {booking.treatment.name}",
            data={"booking_id": str(booking.id), "code": booking.code},
        )
        logger.info(f"[NOTIFICATION] Created booking_created for therapist {booking.therapist_id}")
        return

    # Get previous status if not provided
    if previous_status is None:
        previous_status = _get_previous_status(Booking, booking)

    if previous_status == booking.status:
        return

    logger.info(f"[NOTIFICATION] Booking status changed: {previous_status} -> {booking.status}")

    status_type_map = {
        "confirmed": ("booking_confirmed", f"Kỹ thuật viên đã chấp nhận lịch hẹn **{booking.code}**"),
        "rejected": ("booking_rejected", f"Kỹ thuật viên đã từ chối lịch hẹn **{booking.code}**"),
        "cancelled": ("booking_cancelled", f"Lịch hẹn **{booking.code}** đã bị hủy"),
        "completed": ("booking_completed", f"Lịch hẹn **{booking.code}** hoàn thành"),
        "in_progress": ("booking_in_progress", f"Lịch hẹn **{booking.code}** đang được thực hiện"),
    }

    if booking.status in status_type_map:
        notification_type, title = status_type_map[booking.status]

        # Notify customer for all status changes
        Notification.objects.create(
            recipient=booking.customer,
            notification_type=notification_type,
            title=title,
            message=f"Dịch vụ: {booking.treatment.name} với KTV {booking.therapist.full_name}",
            data={"booking_id": str(booking.id), "code": booking.code},
        )
        logger.info(f"[NOTIFICATION] Created {notification_type} for customer {booking.customer_id}")

        # Also notify therapist when booking is cancelled
        if booking.status == "cancelled":
            Notification.objects.create(
                recipient=booking.therapist,
                notification_type="booking_cancelled",
                title=f"Lịch hẹn **{booking.code}** đã bị hủy bởi khách hàng",
                message=f"Khách hàng {booking.customer.full_name} đã hủy lịch hẹn dịch vụ {booking.treatment.name}",
                data={"booking_id": str(booking.id), "code": booking.code},
            )
            logger.info(f"[NOTIFICATION] Created booking_cancelled for therapist {booking.therapist_id}")


@receiver(post_save, sender=Booking)
def create_booking_notification(sender, instance, created, **kwargs):
    """Signal handler for Booking post_save - creates notifications."""
    create_booking_notifications(instance, created=created)


def create_payment_notifications(payment, previous_status=None, created=False):
    """Create notifications for payment events.
    
    This function can be called directly or via signals.
    Args:
        payment: The Payment instance
        previous_status: Previous status (auto-fetched if not provided)
        created: Whether this is a new payment
    """
    logger.info(f"[NOTIFICATION] Creating payment notification: created={created}, status={payment.status}")

    if created:
        # Don't send payment_pending notification to customer - only notify therapist when payment succeeds
        return

    # Get previous status if not provided
    if previous_status is None:
        previous_status = _get_previous_status(Payment, payment)

    if previous_status == payment.status:
        return

    logger.info(f"[NOTIFICATION] Payment status changed: {previous_status} -> {payment.status}")

    if payment.status == "success":
        Notification.objects.create(
            recipient=payment.booking.customer,
            notification_type="payment_success",
            title=f"Thanh toán cho lịch hẹn **{payment.booking.code}** thành công",
            message=f"Số tiền {payment.amount:,.0f}đ đã được thanh toán",
            data={"booking_id": str(payment.booking.id), "payment_id": str(payment.id)},
        )
        logger.info(f"[NOTIFICATION] Created payment_success for customer {payment.booking.customer_id}")

        # Also notify therapist with customer name
        Notification.objects.create(
            recipient=payment.booking.therapist,
            notification_type="payment_success",
            title=f"Khách hàng **{payment.booking.customer.full_name}** đã thanh toán cho lịch hẹn **{payment.booking.code}**",
            message=f"Số tiền {payment.amount:,.0f}đ đã được thanh toán thành công",
            data={"booking_id": str(payment.booking.id), "payment_id": str(payment.id)},
        )
        logger.info(f"[NOTIFICATION] Created payment_success for therapist {payment.booking.therapist_id}")

    elif payment.status == "failed":
        Notification.objects.create(
            recipient=payment.booking.customer,
            notification_type="payment_failed",
            title=f"Thanh toán cho lịch hẹn **{payment.booking.code}** thất bại",
            message=f"Vui lòng thử lại thanh toán {payment.amount:,.0f}đ",
            data={"booking_id": str(payment.booking.id), "payment_id": str(payment.id)},
        )
        logger.info(f"[NOTIFICATION] Created payment_failed for customer {payment.booking.customer_id}")

    elif payment.status == "refunded":
        Notification.objects.create(
            recipient=payment.booking.customer,
            notification_type="payment_refunded",
            title=f"Thanh toán lịch hẹn **{payment.booking.code}** đã hoàn tiền",
            message=f"Số tiền {payment.amount:,.0f}đ đã được hoàn về tài khoản",
            data={"booking_id": str(payment.booking.id), "payment_id": str(payment.id)},
        )
        logger.info(f"[NOTIFICATION] Created payment_refunded for customer {payment.booking.customer_id}")

        # Also notify therapist about refund
        Notification.objects.create(
            recipient=payment.booking.therapist,
            notification_type="payment_refunded",
            title=f"Thanh toán lịch hẹn **{payment.booking.code}** đã hoàn tiền",
            message=f"Số tiền {payment.amount:,.0f}đ đã được hoàn về tài khoản khách hàng",
            data={"booking_id": str(payment.booking.id), "payment_id": str(payment.id)},
        )
        logger.info(f"[NOTIFICATION] Created payment_refunded for therapist {payment.booking.therapist_id}")


@receiver(post_save, sender=Payment)
def create_payment_notification(sender, instance, created, **kwargs):
    """Signal handler for Payment post_save - creates notifications."""
    create_payment_notifications(instance, created=created)


@receiver(post_save, sender=TherapistProfile)
def create_therapist_status_notification(sender, instance, created, **kwargs):
    if created:
        return

    previous = _get_previous_status(TherapistProfile, instance)
    if previous == instance.status:
        return

    if instance.status == "approved":
        Notification.objects.create(
            recipient=instance.user,
            notification_type="therapist_approved",
            title="Hồ sơ kỹ thuật viên đã được duyệt",
            message="Chúc mừng bạn! Hồ sơ của bạn đã được admin phê duyệt.",
            data={"profile_id": str(instance.id)},
        )
    elif instance.status == "rejected":
        Notification.objects.create(
            recipient=instance.user,
            notification_type="therapist_rejected",
            title="Hồ sơ kỹ thuật viên bị từ chối",
            message="Rất tiếc, hồ sơ của bạn chưa đáp ứng yêu cầu. Vui lòng cập nhật và gửi lại.",
            data={"profile_id": str(instance.id)},
        )
