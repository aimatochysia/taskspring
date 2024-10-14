from django.db import models
import uuid
from django.utils import timezone

class User(models.Model):
    user_id = models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)
    user_email = models.EmailField(unique=True)
    user_password = models.CharField(max_length=255)
    user_role = models.CharField(max_length=50, default='free')
    user_verif_status = models.BooleanField(default=False)
    user_sub_end_date = models.DateField(null=True, blank=True)
    user_created_at = models.DateTimeField(auto_now_add=True)
    user_updated_at = models.DateTimeField(auto_now=True)
