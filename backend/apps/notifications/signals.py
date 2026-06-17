"""Notification signals."""
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.bookings.models import Booking
from apps.notifications.models import Notification
from apps.payments.models import Payment
from apps.therapists.models import TherapistProfile


def _get_previous_status(model_class, instance):
    if not instance.pk:
        return None
    try:
        return model_class.objects.only("status").get(pk=instance.pk).status
    except model_class.DoesNotExist:
        return None


@receiver(post_save, sender=Booking)
def create_booking_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            recipient=instance.therapist,
            notification_type="booking_created",
            title=f"Bạn có lịch hẹn mới từ **{instance.customer.full_name}**",
            message=f"Lịch hẹn {instance.code} — {instance.treatment.name}",
            data={"booking_id": str(instance.id), "code": instance.code},
        )
        return

    previous = _get_previous_status(Booking, instance)
    if previous == instance.status:
        return

    status_type_map = {
        "confirmed": ("booking_confirmed", f"Lịch hẹn **{instance.code}** đã được xác nhận"),
        "rejected": ("booking_rejected", f"Lịch hẹn **{instance.code}** bị từ chối"),
        "cancelled": ("booking_cancelled", f"Lịch hẹn **{instance.code}** đã bị hủy"),
        "completed": ("booking_completed", f"Lịch hẹn **{instance.code}** hoàn thành"),
        "in_progress": ("booking_in_progress", f"Lịch hẹn **{instance.code}** đang được thực hiện"),
    }

    if instance.status in status_type_map:
        notification_type, title = status_type_map[instance.status]
        Notification.objects.create(
            recipient=instance.customer,
            notification_type=notification_type,
            title=title,
            message=f"Dịch vụ: {instance.treatment.name}",
            data={"booking_id": str(instance.id), "code": instance.code},
        )


@receiver(post_save, sender=Payment)
def create_payment_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            recipient=instance.booking.customer,
            notification_type="payment_pending",
            title=f"Yêu cầu thanh toán cho lịch hẹn **{instance.booking.code}**",
            message=f"Vui lòng thanh toán {instance.amount:,.0f}đ qua VNPAY",
            data={"booking_id": str(instance.booking.id), "payment_id": str(instance.id)},
        )
        return

    previous = _get_previous_status(Payment, instance)
    if previous == instance.status:
        return

    if instance.status == "success":
        Notification.objects.create(
            recipient=instance.booking.customer,
            notification_type="payment_success",
            title=f"Thanh toán cho lịch hẹn **{instance.booking.code}** thành công",
            message=f"Số tiền {instance.amount:,.0f}đ đã được thanh toán",
            data={"booking_id": str(instance.booking.id), "payment_id": str(instance.id)},
        )
    elif instance.status == "failed":
        Notification.objects.create(
            recipient=instance.booking.customer,
            notification_type="payment_failed",
            title=f"Thanh toán cho lịch hẹn **{instance.booking.code}** thất bại",
            message=f"Vui lòng thử lại thanh toán {instance.amount:,.0f}đ",
            data={"booking_id": str(instance.booking.id), "payment_id": str(instance.id)},
        )
    elif instance.status == "refunded":
        Notification.objects.create(
            recipient=instance.booking.customer,
            notification_type="payment_refunded",
            title=f"Thanh toán lịch hẹn **{instance.booking.code}** đã hoàn tiền",
            message=f"Số tiền {instance.amount:,.0f}đ đã được hoàn về tài khoản",
            data={"booking_id": str(instance.booking.id), "payment_id": str(instance.id)},
        )


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
