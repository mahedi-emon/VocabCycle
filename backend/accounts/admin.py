"""Accounts app – Django Admin registration."""

from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin for the User model."""

    list_display = [
        "email",
        "name",
        "email_verified",
        "reminder_on",
        "is_active",
        "created_at",
    ]
    list_filter = ["email_verified", "reminder_on", "is_active", "is_staff"]
    search_fields = ["email", "name", "username"]
    ordering = ["-created_at"]

    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "VocabCycle Profile",
            {
                "fields": (
                    "name",
                    "profile_pic",
                    "email_verified",
                    "reminder_on",
                ),
            },
        ),
    )
