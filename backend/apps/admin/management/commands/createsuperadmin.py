from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Tạo hoặc cập nhật tài khoản admin"

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True, help="Email admin")
        parser.add_argument("--password", required=True, help="Mật khẩu admin")

    def handle(self, *args, **options):
        email = options["email"]
        password = options["password"]

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "full_name": "Admin",
                "role": "admin",
                "is_staff": True,
                "is_superuser": True,
            }
        )

        if not created:
            user.role = "admin"
            user.is_staff = True
            user.is_superuser = True
            self.stdout.write(self.style.WARNING(f"Cập nhật user {email} thành admin"))
        else:
            self.stdout.write(self.style.SUCCESS(f"Tạo mới admin {email}"))

        user.set_password(password)
        user.save()

        self.stdout.write(self.style.SUCCESS(f"Admin account ready: {email}"))