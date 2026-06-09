from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Seed admin account mặc định"

    def handle(self, *args, **options):
        email = "admin@jvoj.com"
        password = "JvJ@2026"

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "full_name": "Admin JvJ",
                "role": "admin",
                "is_staff": True,
                "is_superuser": True,
            }
        )

        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Created admin: {email}"))
        else:
            user.role = "admin"
            user.is_staff = True
            user.is_superuser = True
            user.save(update_fields=["role", "is_staff", "is_superuser"])
            self.stdout.write(self.style.WARNING(f"Admin already exists: {email}"))