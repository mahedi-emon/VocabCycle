"""
Accounts app – Serializers for auth, profile, and settings.
"""

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration via email/password."""

    password = serializers.CharField(
        write_only=True, min_length=8, validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["email", "name", "password", "password_confirm"]

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        # Generate a username from the email (before the @)
        email = validated_data["email"]
        base_username = email.split("@")[0]
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User.objects.create_user(
            username=username,
            email=validated_data["email"],
            name=validated_data.get("name", ""),
            password=validated_data["password"],
        )
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for email/password login."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class GoogleAuthSerializer(serializers.Serializer):
    """Serializer for Google OAuth2 token exchange."""

    token = serializers.CharField(help_text="Google OAuth2 ID token")


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for reading/updating user profile."""

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "name",
            "profile_pic",
            "email_verified",
            "reminder_on",
            "created_at",
        ]
        read_only_fields = ["id", "email", "email_verified", "created_at"]


class UserSettingsSerializer(serializers.ModelSerializer):
    """Serializer for updating user notification settings."""

    class Meta:
        model = User
        fields = ["reminder_on"]


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password."""

    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(
        write_only=True, min_length=8, validators=[validate_password]
    )

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(min_length=6, max_length=6)
    new_password = serializers.CharField(
        write_only=True, min_length=8, validators=[validate_password]
    )

