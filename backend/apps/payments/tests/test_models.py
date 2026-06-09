"""Tests cho Payment và PaymentTimeline models."""
import pytest
from decimal import Decimal

from apps.payments.models import Payment, PaymentTimeline


@pytest.mark.django_db
class TestPaymentModel:
    def test_create_payment(self, booking):
        payment = Payment.objects.create(
            booking=booking,
            method="vnpay_qr",
            amount=booking.total_amount,
        )

        assert payment.status == "pending"
        assert payment.amount == booking.total_amount

    def test_mark_success_updates_booking(self, booking):
        payment = Payment.objects.create(
            booking=booking,
            method="vnpay_qr",
            amount=booking.total_amount,
        )

        payment.mark_success()

        assert payment.status == "success"
        assert payment.vnpay_response_code == "00"
        assert payment.completed_at is not None

        booking.refresh_from_db()
        assert booking.payment_status == "paid"

    def test_mark_failed_updates_booking(self, booking):
        payment = Payment.objects.create(
            booking=booking,
            method="vnpay_qr",
            amount=booking.total_amount,
        )

        payment.mark_failed("24")

        assert payment.status == "failed"
        assert payment.vnpay_response_code == "24"

        booking.refresh_from_db()
        assert booking.payment_status == "failed"

    def test_payment_str(self, booking):
        payment = Payment(booking=booking, method="vnpay_qr", amount=booking.total_amount)
        assert booking.code in str(payment)


@pytest.mark.django_db
class TestPaymentTimeline:
    def test_create_timeline_entry(self, booking):
        payment = Payment.objects.create(
            booking=booking,
            method="vnpay_qr",
            amount=booking.total_amount,
        )

        PaymentTimeline.objects.create(
            payment=payment,
            label="Khởi tạo thanh toán",
            tone="neutral",
        )

        assert payment.timeline.count() == 1
        entry = payment.timeline.first()
        assert entry.tone == "neutral"

    def test_timeline_append_only(self, booking):
        payment = Payment.objects.create(
            booking=booking,
            method="vnpay_qr",
            amount=booking.total_amount,
        )

        PaymentTimeline.objects.create(payment=payment, label="Step 1", tone="neutral")
        PaymentTimeline.objects.create(payment=payment, label="Step 2", tone="success")

        assert payment.timeline.count() == 2
        labels = [e.label for e in payment.timeline.all()]
        assert labels == ["Step 1", "Step 2"]
