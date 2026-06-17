"""Notification signals."""
import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.bookings.models import Booking
from apps.notifications.models import Notification
from apps.payments.models import Payment
from apps.therapists.models import TherapistProfile

logger = logging.getLogger(__name__)


def _get_previous_status(model_class, instance):
    if not instance.pk:
        return None
    try:
        return model_class.objects.only("status").get(pk=instance.pk).status
    except model_class.DoesNotExist:
        return None


@receiver(post_save, sender=Booking)
def create_booking_notification(sender, instance, created, **kwargs):
    logger.info(f"[NOTIFICATION] Booking signal: created={created}, status={instance.status}")

    if created:
        Notification.objects.create(
            recipient=instance.therapist,
            notification_type="booking_created",
            title=f"Bạn có lịch hẹn mới từ **{instance.customer.full_name}**",
            message=f"Lịch hẹn {instance.code} — {instance.treatment.name}",
            data={"booking_id": str(instance.id), "code": instance.code},
        )
        logger.info(f"[NOTIFICATION] Created booking_created for therapist {instance.therapist_id}")
        return

    previous = _get_previous_status(Booking, instance)
    if previous == instance.status:
        return

    logger.info(f"[NOTIFICATION] Booking status changed: {previous} -> {instance.status}")

    status_type_map = {
        "confirmed": ("booking_confirmed", f"Kỹ thuật viên đã chấp nhận lịch hẹn **{instance.code}**"),
        "rejected": ("booking_rejected", f"Kỹ thuật viên đã từ chối lịch hẹn **{instance.code}**"),
        "cancelled": ("booking_cancelled", f"Lịch hẹn **{instance.code}** đã bị hủy"),
        "completed": ("booking_completed", f"Lịch hẹn **{instance.code}** hoàn thành"),
        "in_progress": ("booking_in_progress", f"Lịch hẹn **{instance.code}** đang được thực hiện"),
    }

    if instance.status in status_type_map:
        notification_type, title = status_type_map[instance.status]

        # Notify customer for all status changes
        Notification.objects.create(
            recipient=instance.customer,
            notification_type=notification_type,
            title=title,
            message=f"Dịch vụ: {instance.treatment.name} với KTV {instance.therapist.full_name}",
            data={"booking_id": str(instance.id), "code": instance.code},
        )
        logger.info(f"[NOTIFICATION] Created {notification_type} for customer {instance.customer_id}")

        # Also notify therapist when booking is cancelled
        if instance.status == "cancelled":
            Notification.objects.create(
                recipient=instance.therapist,
                notification_type="booking_cancelled",
                title=f"Lịch hẹn **{instance.code}** đã bị hủy bởi khách hàng",
                message=f"Khách hàng {instance.customer.full_name} đã hủy lịch hẹn dịch vụ {instance.treatment.name}",
                data={"booking_id": str(instance.id), "code": instance.code},
            )
            logger.info(f"[NOTIFICATION] Created booking_cancelled for therapist {instance.therapist_id}")


@receiver(post_save, sender=Payment)
def create_payment_notification(sender, instance, created, **kwargs):
    logger.info(f"[NOTIFICATION] Payment signal: created={created}, status={instance.status}")

    if created:
        Notification.objects.create(
            recipient=instance.booking.customer,
            notification_type="payment_pending",
            title=f"Yêu cầu thanh toán cho lịch hẹn **{instance.booking.code}**",
            message=f"Vui lòng thanh toán {instance.amount:,.0f}đ qua VNPAY",
            data={"booking_id": str(instance.booking.id), "payment_id": str(instance.id)},
        )
        logger.info(f"[NOTIFICATION] Created payment_pending for customer {instance.booking.customer_id}")
        return

    previous = _get_previous_status(Payment, instance)
    if previous == instance.status:
        return

    logger.info(f"[NOTIFICATION] Payment status changed: {previous} -> {instance.status}")

    if instance.status == "success":
        Notification.objects.create(
            recipient=instance.booking.customer,
            notification_type="payment_success",
            title=f"Thanh toán cho lịch hẹn **{instance.booking.code}** thành công",
            message=f"Số tiền {instance.amount:,.0f}đ đã được thanh toán",
            data={"booking_id": str(instance.booking.id), "payment_id": str(instance.id)},
        )
        logger.info(f"[NOTIFICATION] Created payment_success for customer {instance.booking.customer_id}")

        # Also notify therapist
        Notification.objects.create(
            recipient=instance.booking.therapist,
            notification_type="payment_success",
            title=f"Khách hàng đã thanh toán lịch hẹn **{instance.booking.code}**",
            message=f"Số tiền {instance.amount:,.0f}đ đã được thanh toán thành công",
            data={"booking_id": str(instance.booking.id), "payment_id": str(instance.id)},
        )
        logger.info(f"[NOTIFICATION] Created payment_success for therapist {instance.booking.therapist_id}")

    elif instance.status == "failed":
        Notification.objects.create(
            recipient=instance.booking.customer,
            notification_type="payment_failed",
            title=f"Thanh toán cho lịch hẹn **{instance.booking.code}** thất bại",
            message=f"Vui lòng thử lại thanh toán {instance.amount:,.0f}đ",
            data={"booking_id": str(instance.booking.id), "payment_id": str(instance.id)},
        )
        logger.info(f"[NOTIFICATION] Created payment_failed for customer {instance.booking.customer_id}")

    elif instance.status == "refunded":
        Notification.objects.create(
            recipient=instance.booking.customer,
            notification_type="payment_refunded",
            title=f"Thanh toán lịch hẹn **{instance.booking.code}** đã hoàn tiền",
            message=f"Số tiền {instance.amount:,.0f}đ đã được hoàn về tài khoản",
            data={"booking_id": str(instance.booking.id), "payment_id": str(instance.id)},
        )
        logger.info(f"[NOTIFICATION] Created payment_refunded for customer {instance.booking.customer_id}")


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
