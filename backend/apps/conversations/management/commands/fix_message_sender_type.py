from django.core.management.base import BaseCommand
from apps.conversations.models import Message
from django.contrib.auth import get_user_model


User = get_user_model()


class Command(BaseCommand):
    help = "Backfill sender_type for existing messages"

    def handle(self, *args, **options):
        updated = 0
        for message in Message.objects.all():
            if not message.sender_type:
                try:
                    user = User.objects.get(pk=message.sender_id)
                    message.sender_type = user.role
                    message.save(update_fields=["sender_type"])
                    updated += 1
                except User.DoesNotExist:
                    pass

        self.stdout.write(self.style.SUCCESS(f"Updated {updated} messages."))
