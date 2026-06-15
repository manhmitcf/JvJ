from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Create or reset an admin user"

    def add_arguments(self, parser):
        parser.add_argument("--email", required=False)
        parser.add_argument("--password", required=False)
        parser.add_argument("--name", default="Admin")
        parser.add_argument("--force", action="store_true")

    def handle(self, *args, **options):
        email = options.get("email")
        password = options.get("password")

        if not email or not password:
            self.stdout.write("Admin email: ")
            email = input().strip() or email
            self.stdout.write("Password: ")
            password = input().strip() or password

        if not email or not password:
            self.stdout.write(self.style.ERROR("Email and password are required."))
            return

        user, created = User.objects.update_or_create(
            email=email,
            defaults={
                "full_name": options.get("name"),
                "role": "admin",
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
            },
        )

        user.set_password(password)
        user.save(update_fields=["password", "full_name", "role", "is_staff", "is_superuser", "is_active"])

        self.stdout.write(self.style.SUCCESS(f"Admin ready: {user.email}"))
