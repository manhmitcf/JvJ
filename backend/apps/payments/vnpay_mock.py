"""VNPAY payment simulation logic."""
import random
import uuid


class VNPAYSimulator:
    """Giả lập VNPAY payment gateway cho dev/testing."""

    @staticmethod
    def generate_payment_url(payment) -> dict:
        """Tạo mock payment URL và QR code data."""
        return {
            "payment_url": f"https://sandbox.vnpayment.vn/payment?txn={uuid.uuid4().hex[:16]}",
            "qr_code": f"000201010212{uuid.uuid4().hex[:20]}JvJ{payment.id.hex[:8]}",
            "amount": str(payment.amount),
            "booking_code": payment.booking.code,
        }

    @staticmethod
    def simulate_callback(success: bool = True) -> dict:
        """Mô phỏng VNPAY callback."""
        if success:
            return {
                "vnp_ResponseCode": "00",
                "vnp_TransactionStatus": "00",
                "vnp_TransactionNo": f"VNPAY-{uuid.uuid4().hex[:12].upper()}",
                "success": True,
            }
        else:
            error_codes = ["24", "51", "65", "77"]
            return {
                "vnp_ResponseCode": random.choice(error_codes),
                "vnp_TransactionStatus": "01",
                "vnp_TransactionNo": "",
                "success": False,
            }

    @staticmethod
    def simulate_refund() -> dict:
        """Mô phỏng VNPAY refund."""
        return {
            "vnp_ResponseCode": "00",
            "vnp_TransactionNo": f"REFUND-{uuid.uuid4().hex[:12].upper()}",
            "success": True,
        }
