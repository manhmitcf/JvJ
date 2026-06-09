# Generated manually for JvJ Phase 1 Spa model

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Spa",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=255)),
                ("address", models.TextField()),
                ("district", models.CharField(max_length=100)),
                ("latitude", models.DecimalField(max_digits=9, decimal_places=6)),
                ("longitude", models.DecimalField(max_digits=9, decimal_places=6)),
                ("location", models.JSONField(null=True, editable=False)),
                ("phone", models.CharField(max_length=20)),
                ("email", models.EmailField(max_length=254)),
                ("open_time", models.TimeField()),
                ("close_time", models.TimeField()),
                ("description", models.TextField()),
                ("status", models.CharField(choices=[("active", "Active"), ("hidden", "Hidden")], default="active", max_length=10)),
                ("image_urls", models.JSONField(default=list, blank=True)),
                ("linked_treatment_count", models.IntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "db_table": "spas_spa",
                "ordering": ["name"],
                "indexes": [
                    models.Index(fields=["status"], name="spas_spa_status_8fb012_idx"),
                    models.Index(fields=["district"], name="spas_spa_distric_27ed0f_idx"),
                ],
            },
        ),
    ]
