"""Add credential_update_status to TherapistProfile."""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("therapists", "0004_add_pending_credential_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="therapistprofile",
            name="credential_update_status",
            field=models.CharField(
                choices=[
                    ("none", "No Update"),
                    ("pending", "Pending"),
                    ("approved", "Approved"),
                    ("rejected", "Rejected"),
                ],
                default="none",
                max_length=20,
                db_index=True,
                help_text="Trạng thái yêu cầu cập nhật giấy tờ",
            ),
        ),
    ]
