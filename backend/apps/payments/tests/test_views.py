"""Tests cho Payment API endpoints."""
import pytest
from decimal import Decimal
from rest_framework import status

from apps.payments.models import Payment, PaymentTimeline

# Base path — routes include tại /api/v1/payments/
PAYMENT_BASE = "/api/v1/payments"


@pytest.mark.django_db
class TestPaymentInitiate:
    def test_initiate_payment(self, auth_client, user, booking):
        booking.customer_id = user.id
        booking.save()

        response = auth_client.post(f"{PAYMENT_BASE}/{booking.id}/initiate/", format="json")

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()["data"]
        assert data["status"] == "pending"
        assert "payment_url" in data
        assert "qr_code" in data

        assert Payment.objects.filter(booking=booking).exists()

    def test_cannot_initiate_for_others(self, auth_client, user_factory, user, booking):
        # booking belongs to conftest's user; reassign auth_client to different customer
        other = user_factory(email="other@cust.com", full_name="Other", role="customer", password="testpass123")
        from rest_framework.test import APIClient
        from rest_framework_simplejwt.tokens import RefreshToken
        api_client = APIClient()
        refresh = RefreshToken.for_user(other)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

        response = api_client.post(f"{PAYMENT_BASE}/{booking.id}/initiate/")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_duplicate_initiate_returns_existing(self, auth_client, user, booking):
        booking.customer_id = user.id
        booking.save()
        Payment.objects.create(booking=booking, method="vnpay_qr", amount=booking.total_amount)

        response = auth_client.post(f"{PAYMENT_BASE}/{booking.id}/initiate/")

        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestPaymentSimulate:
    def test_simulate_success(self, auth_client, user, booking):
        booking.customer_id = user.id
        booking.save()
        Payment.objects.create(booking=booking, method="vnpay_qr", amount=booking.total_amount)

        response = auth_client.post(
            f"{PAYMENT_BASE}/{booking.id}/simulate/",
            {"success": True},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert data["status"] == "success"

        booking.refresh_from_db()
        assert booking.payment_status == "paid"

        assert booking.payment.timeline.filter(tone="success").exists()

    def test_simulate_failure(self, auth_client, user, booking):
        booking.customer_id = user.id
        booking.save()
        Payment.objects.create(booking=booking, method="vnpay_qr", amount=booking.total_amount)

        response = auth_client.post(
            f"{PAYMENT_BASE}/{booking.id}/simulate/",
            {"success": False},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert data["status"] == "failed"

        booking.refresh_from_db()
        assert booking.payment_status == "failed"


@pytest.mark.django_db
class TestPaymentTimeline:
    def test_get_timeline(self, auth_client, user, booking):
        booking.customer_id = user.id
        booking.save()
        payment = Payment.objects.create(booking=booking, method="vnpay_qr", amount=booking.total_amount)
        PaymentTimeline.objects.create(payment=payment, label="Test event", tone="neutral")

        response = auth_client.get(f"{PAYMENT_BASE}/{booking.id}/timeline/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert len(data) == 1
        assert data[0]["label"] == "Test event"


@pytest.mark.django_db
class TestPaymentRefund:
    def test_admin_can_refund(self, admin_client, booking):
        booking.save()
        payment = Payment.objects.create(booking=booking, method="vnpay_qr", amount=booking.total_amount)
        payment.mark_success()

        response = admin_client.post(f"{PAYMENT_BASE}/{booking.id}/refund/")

        assert response.status_code == status.HTTP_200_OK

        booking.refresh_from_db()
        assert booking.payment_status == "unpaid"

    def test_customer_cannot_refund(self, auth_client, user, booking):
        booking.customer_id = user.id
        booking.save()
        payment = Payment.objects.create(booking=booking, method="vnpay_qr", amount=booking.total_amount)
        payment.mark_success()

        response = auth_client.post(f"{PAYMENT_BASE}/{booking.id}/refund/")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_cannot_refund_failed_payment(self, admin_client, booking):
        booking.save()
        Payment.objects.create(booking=booking, method="vnpay_qr", amount=booking.total_amount, status="failed")

        response = admin_client.post(f"{PAYMENT_BASE}/{booking.id}/refund/")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
