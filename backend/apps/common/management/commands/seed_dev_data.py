"""Management command: seed dev data vào Supabase."""
import random
from datetime import datetime, time, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

User = get_user_model()


class Command(BaseCommand):
    """Seed dữ liệu demo cho môi trường dev."""

    help = "Tạo dữ liệu demo: user, spa Đà Nẵng, treatment, timeslot, booking, review."

    def handle(self, *args, **options):
        """Entry point."""
        self.stdout.write("Bắt đầu seed dev data...")

        with transaction.atomic():
            # Users
            admin_user = self._seed_admin()
            customer_user = self._seed_customer()
            therapist_approved, therapist_pending = self._seed_therapists()

            # Spas
            spas = self._seed_spas()

            # Treatments
            treatments = self._seed_treatments(therapist_approved, spas)

            # Timeslots
            self._seed_timeslots([therapist_approved, therapist_pending])

            # Bookings
            bookings = self._seed_bookings(customer_user, therapist_approved, treatments)

            # Reviews
            self._seed_reviews(customer_user, therapist_approved, treatments, bookings)

        self.stdout.write(self.style.SUCCESS("✓ Seed dev data hoàn tất."))

    def _seed_admin(self):
        """Seed admin user."""
        admin, created = User.objects.get_or_create(
            email="admin@jvj.vn",
            defaults={
                "full_name": "Admin JvJ",
                "phone": "0901000001",
                "role": "admin",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if created:
            admin.set_password("admin123")
            admin.save()
            self.stdout.write("  → Tạo admin@jvj.vn")
        else:
            self.stdout.write("  → admin@jvj.vn đã tồn tại")
        return admin

    def _seed_customer(self):
        """Seed customer user."""
        customer, created = User.objects.get_or_create(
            email="customer@jvj.vn",
            defaults={
                "full_name": "Khách hàng Demo",
                "phone": "0902000001",
                "role": "customer",
            },
        )
        if created:
            customer.set_password("customer123")
            customer.save()
            self.stdout.write("  → Tạo customer@jvj.vn")
        else:
            self.stdout.write("  → customer@jvj.vn đã tồn tại")
        return customer

    def _seed_therapists(self):
        """Seed therapist users + profile."""
        from apps.therapists.models import TherapistProfile

        # Approved therapist
        therapist_approved, created = User.objects.get_or_create(
            email="therapist.approved@jvj.vn",
            defaults={
                "full_name": "Kỹ thuật viên Duyệt",
                "phone": "0903000001",
                "role": "therapist",
            },
        )
        if created:
            therapist_approved.set_password("therapist123")
            therapist_approved.save()
            self.stdout.write("  → Tạo therapist.approved@jvj.vn")
        else:
            self.stdout.write("  → therapist.approved@jvj.vn đã tồn tại")

        # Profile approved
        profile_approved, _ = TherapistProfile.objects.get_or_create(
            user=therapist_approved,
            defaults={
                "years_of_experience": 5,
                "specialties": "Massage trị liệu, Vật lý trị liệu",
                "certificate_urls": ["https://example.com/cert1.jpg"],
                "status": "approved",
                "rating": Decimal("4.8"),
                "completed_bookings": 120,
            },
        )

        # Pending therapist
        therapist_pending, created = User.objects.get_or_create(
            email="therapist.pending@jvj.vn",
            defaults={
                "full_name": "Kỹ thuật viên Chờ duyệt",
                "phone": "0903000002",
                "role": "therapist",
            },
        )
        if created:
            therapist_pending.set_password("therapist123")
            therapist_pending.save()
            self.stdout.write("  → Tạo therapist.pending@jvj.vn")
        else:
            self.stdout.write("  → therapist.pending@jvj.vn đã tồn tại")

        # Profile pending
        TherapistProfile.objects.get_or_create(
            user=therapist_pending,
            defaults={
                "years_of_experience": 2,
                "specialties": "Massage chân, Chăm sóc da",
                "certificate_urls": [],
                "status": "pending_approval",
            },
        )

        return therapist_approved, therapist_pending

    def _seed_spas(self):
        """Seed spas ở Đà Nẵng."""
        from apps.spas.models import Spa

        spa_data = [
            {
                "name": "JvJ Wellness Hải Châu",
                "address": "123 Đường 2/9, Hải Châu, Đà Nẵng",
                "district": "Hải Châu",
                "description": "Cơ sở chính tại trung tâm thành phố.",
                "latitude": 16.0544,
                "longitude": 108.2022,
                "open_time": time(8, 0),
                "close_time": time(21, 0),
            },
            {
                "name": "JvJ Wellness Sơn Trà",
                "address": "456 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng",
                "district": "Sơn Trà",
                "description": "Chi nhánh gần biển Mỹ Khê.",
                "latitude": 16.0471,
                "longitude": 108.2425,
                "open_time": time(8, 0),
                "close_time": time(21, 0),
            },
            {
                "name": "JvJ Wellness Ngũ Hành Sơn",
                "address": "789 Huỳnh Tấn Phát, Ngũ Hành Sơn, Đà Nẵng",
                "district": "Ngũ Hành Sơn",
                "description": "Chi nhánh gần Non Nước.",
                "latitude": 16.0011,
                "longitude": 108.2615,
                "open_time": time(8, 0),
                "close_time": time(21, 0),
            },
            {
                "name": "JvJ Wellness Thanh Khê",
                "address": "321 Ông Ích Khiêm, Thanh Khê, Đà Nẵng",
                "district": "Thanh Khê",
                "description": "Chi nhánh khu dân cư Thanh Khê.",
                "latitude": 16.0736,
                "longitude": 108.1676,
                "open_time": time(8, 0),
                "close_time": time(21, 0),
            },
        ]

        spas = []
        for data in spa_data:
            spa, created = Spa.objects.get_or_create(
                name=data["name"],
                defaults={
                    "address": data["address"],
                    "district": data["district"],
                    "description": data["description"],
                    "latitude": data["latitude"],
                    "longitude": data["longitude"],
                    "open_time": data["open_time"],
                    "close_time": data["close_time"],
                    "status": "active",
                },
            )
            if created:
                self.stdout.write(f"  → Tạo spa {spa.name}")
            spas.append(spa)

        return spas

    def _seed_treatments(self, therapist, spas):
        """Seed treatment demo."""
        from apps.treatments.models import Treatment

        treatment_data = [
            {
                "name": "Massage cổ vai gáy",
                "description": "Giảm đau mỏi vùng cổ vai gáy do làm việc văn phòng.",
                "category": "massage",
                "duration_minutes": 60,
                "price": Decimal("250000"),
            },
            {
                "name": "Vật lý trị liệu phục hồi",
                "description": "Hỗ trợ phục hồi chức năng vận động sau chấn thương.",
                "category": "physiotherapy",
                "duration_minutes": 90,
                "price": Decimal("400000"),
            },
            {
                "name": "Massage thư giãn tại nhà",
                "description": "Dịch vụ massage body thư giãn toàn thân tại nhà.",
                "category": "massage",
                "duration_minutes": 120,
                "price": Decimal("500000"),
            },
            {
                "name": "Bấm huyệt truyền thống",
                "description": "Kỹ thuật bấm huyệt Đông y giúp lưu thông khí huyết.",
                "category": "acupressure",
                "duration_minutes": 60,
                "price": Decimal("300000"),
            },
            {
                "name": "Chăm sóc sau vận động",
                "description": "Phục hồi cơ bắp sau tập luyện thể thao.",
                "category": "sports",
                "duration_minutes": 75,
                "price": Decimal("350000"),
            },
            {
                "name": "Trị liệu lưng dưới",
                "description": "Giảm đau lưng dưới bằng kỹ thuật vật lý trị liệu.",
                "category": "physiotherapy",
                "duration_minutes": 60,
                "price": Decimal("280000"),
            },
        ]

        treatments = []
        for idx, data in enumerate(treatment_data):
            # Xoay vòng spa
            spa = spas[idx % len(spas)]
            treatment, created = Treatment.objects.get_or_create(
                name=data["name"],
                therapist=therapist,
                defaults={
                    "description": data["description"],
                    "category": data["category"],
                    "duration_minutes": data["duration_minutes"],
                    "price": data["price"],
                    "spa": spa,
                    "is_available": True,
                },
            )
            if created:
                self.stdout.write(f"  → Tạo treatment {treatment.name}")
            treatments.append(treatment)

        return treatments

    def _seed_timeslots(self, therapists):
        """Seed timeslot cho 7 ngày tới cho tất cả therapists."""
        from apps.timeslots.models import TimeSlot
        from apps.treatments.models import Treatment

        # Nếu truyền vào 1 therapist, chuyển thành list
        if not isinstance(therapists, list):
            therapists = [therapists]

        today = timezone.now().date()

        for therapist in therapists:
            # Lấy treatment đầu tiên của therapist này
            treatment = Treatment.objects.filter(therapist=therapist).first()
            if not treatment:
                self.stdout.write(self.style.WARNING(f"  ⚠ Therapist {therapist.full_name} không có treatment, bỏ qua"))
                continue

            for day_offset in range(7):
                date = today + timedelta(days=day_offset)
                # Tạo 4 slot mỗi ngày: 8h, 10h, 14h, 16h
                for hour in [8, 10, 14, 16]:
                    start = time(hour, 0)
                    end = time(hour + 2, 0)
                    TimeSlot.objects.get_or_create(
                        therapist=therapist,
                        treatment=treatment,
                        date=date,
                        start_time=start,
                        defaults={
                            "end_time": end,
                            "status": "available",
                        },
                    )
            self.stdout.write(f"  → Tạo timeslot 7 ngày cho {therapist.full_name}")

    def _seed_bookings(self, customer, therapist, treatments):
        """Seed booking mẫu."""
        from apps.bookings.models import Booking
        from apps.timeslots.models import TimeSlot

        # Lấy 3 slot đầu tiên
        slots = list(TimeSlot.objects.filter(therapist=therapist, status="available")[:3])
        if not slots:
            self.stdout.write("  ⚠ Không có slot available, bỏ qua booking seed")
            return []

        booking_data = [
            {
                "status": "pending",
                "payment_status": "unpaid",
                "note": "Khách yêu cầu massage nhẹ nhàng.",
            },
            {
                "status": "confirmed",
                "payment_status": "paid",
                "note": "",
            },
            {
                "status": "completed",
                "payment_status": "paid",
                "note": "Dịch vụ tốt.",
                "completed_at_offset": -2,
            },
        ]

        bookings = []
        for idx, data in enumerate(booking_data):
            if idx >= len(slots):
                break
            slot = slots[idx]
            treatment = treatments[idx % len(treatments)]

            # Dùng create_booking từ manager thay vì get_or_create
            try:
                booking = Booking.objects.create_booking(
                    customer=customer,
                    therapist=therapist,
                    treatment=treatment,
                    timeslot=slot,
                    address="123 Lê Duẩn, Hải Châu, Đà Nẵng",
                    contact_phone=customer.phone,
                    total_amount=treatment.price,
                    note=data["note"],
                )

                # Update status nếu không phải pending
                if data["status"] != "pending":
                    booking.status = data["status"]
                    booking.payment_status = data["payment_status"]
                    if data["status"] == "completed" and "completed_at_offset" in data:
                        booking.completed_at = timezone.now() + timedelta(days=data["completed_at_offset"])
                    booking.save()

                self.stdout.write(f"  → Tạo booking {booking.code}")
                bookings.append(booking)
            except Exception as e:
                self.stdout.write(f"  ⚠ Lỗi tạo booking: {e}")

        return bookings

    def _seed_reviews(self, customer, therapist, treatments, bookings):
        """Seed review cho booking completed."""
        from apps.reviews.models import Review

        # Lấy booking completed
        completed_bookings = [b for b in bookings if b.status == "completed"]
        if not completed_bookings:
            self.stdout.write("  ⚠ Không có booking completed, bỏ qua review seed")
            return

        booking = completed_bookings[0]
        Review.objects.get_or_create(
            booking=booking,
            defaults={
                "customer": customer,
                "therapist": therapist,
                "treatment": booking.treatment,
                "rating": 5,
                "comment": "Dịch vụ rất tốt, kỹ thuật viên nhiệt tình và chuyên nghiệp.",
                "tags": ["Chuyên nghiệp", "Hiệu quả"],
            },
        )
        self.stdout.write("  → Tạo review mẫu")
