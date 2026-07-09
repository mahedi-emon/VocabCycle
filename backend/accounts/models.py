"""
Accounts app – Custom User model for VocabCycle.
"""

import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model extending AbstractUser.
    Uses UUID as PK, email as the unique identifier for login.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    name = models.CharField(max_length=255, blank=True, default="")
    profile_pic = models.URLField(max_length=500, blank=True, default="")
    email_verified = models.BooleanField(default=False)
    reminder_on = models.BooleanField(default=True)
    reminder_hour = models.IntegerField(default=11)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Use email as the login field instead of username
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "name"]

    class Meta:
        db_table = "users"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.email})"


class PasswordResetCode(models.Model):
    """
    Model to store 6-digit password reset verification codes.
    Codes expire after 15 minutes.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(db_index=True)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "password_reset_codes"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.email} - {self.code}"

