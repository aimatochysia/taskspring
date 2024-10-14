# Generated by Django 5.1.2 on 2024-10-13 09:13

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="User",
            fields=[
                (
                    "user_id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("user_email", models.EmailField(max_length=254, unique=True)),
                ("user_password", models.CharField(max_length=255)),
                ("user_role", models.CharField(default="free", max_length=50)),
                ("user_verif_status", models.BooleanField(default=False)),
                ("user_sub_end_date", models.DateField(blank=True, null=True)),
                ("user_created_at", models.DateTimeField(auto_now_add=True)),
                ("user_updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
