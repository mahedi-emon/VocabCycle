"""
Accounts app – Views for authentication, profile, and settings.
"""

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
import random
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import PasswordResetCode
from .serializers import (
    ChangePasswordSerializer,
    GoogleAuthSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserProfileSerializer,
    UserSettingsSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)

User = get_user_model()


def get_tokens_for_user(user):
    """Generate JWT access and refresh tokens for a user."""
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


class RegisterView(generics.CreateAPIView):
    """POST /api/v1/auth/register/ – Create a new user account."""

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []  # Bypass JWT verification

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        return Response(
            {
                "message": "Registration successful.",
                "user": UserProfileSerializer(user).data,
                "tokens": tokens,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """POST /api/v1/auth/login/ – Login with email/password, returns JWT."""

    permission_classes = [permissions.AllowAny]
    authentication_classes = []  # Bypass JWT verification

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            request,
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )

        if user is None:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        tokens = get_tokens_for_user(user)
        return Response(
            {
                "message": "Login successful.",
                "user": UserProfileSerializer(user).data,
                "tokens": tokens,
            },
            status=status.HTTP_200_OK,
        )


class GoogleAuthView(APIView):
    """
    POST /api/v1/auth/google/ – Exchange Google ID token for JWT.
    Verifies the Google token, creates or finds the user, returns JWT.
    """

    permission_classes = [permissions.AllowAny]
    authentication_classes = []  # Skip JWT auth – this is a public endpoint

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        id_token_str = serializer.validated_data["token"]

        try:
            from google.auth.transport import requests as google_requests
            from google.oauth2 import id_token

            idinfo = id_token.verify_oauth2_token(
                id_token_str,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Google token verification failed: {e}")
            return Response(
                {"error": "Invalid Google token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = idinfo.get("email")
        name = idinfo.get("name", "")
        picture = idinfo.get("picture", "")

        if not email:
            return Response(
                {"error": "Google token does not contain an email."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Find or create user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": email.split("@")[0],
                "name": name,
                "profile_pic": picture,
                "email_verified": True,
            },
        )

        if not created:
            # Update profile pic and name if changed
            updated = False
            if picture and user.profile_pic != picture:
                user.profile_pic = picture
                updated = True
            if name and user.name != name:
                user.name = name
                updated = True
            if not user.email_verified:
                user.email_verified = True
                updated = True
            if updated:
                user.save()

        tokens = get_tokens_for_user(user)
        return Response(
            {
                "message": "Google login successful.",
                "user": UserProfileSerializer(user).data,
                "tokens": tokens,
                "created": created,
            },
            status=status.HTTP_200_OK,
        )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """GET/PUT /api/v1/user/ – View or update the current user's profile."""

    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


class UserSettingsView(generics.UpdateAPIView):
    """PUT /api/v1/user/settings/ – Toggle reminder and other settings."""

    serializer_class = UserSettingsSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """POST /api/v1/user/change-password/ – Change the current user's password."""

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()

        return Response(
            {"message": "Password changed successfully."},
            status=status.HTTP_200_OK,
        )


class PasswordResetRequestView(APIView):
    """
    POST /api/v1/auth/password-reset/request/
    Sends a 6-digit code to the user's email if it exists.
    """

    permission_classes = [permissions.AllowAny]
    authentication_classes = []  # Bypass JWT verification

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower().strip()

        # Check if user exists
        user_exists = User.objects.filter(email=email).exists()

        if user_exists:
            # Generate 6-digit code
            code = f"{random.randint(100000, 999999)}"
            
            # Save code
            PasswordResetCode.objects.create(email=email, code=code)

            # Send email
            try:
                send_mail(
                    subject="VocabCycle Password Reset Verification Code",
                    message=f"Hello,\n\nYou requested a password reset for your VocabCycle account.\n\nYour verification code is: {code}\n\nThis code will expire in 15 minutes.\n\nIf you did not request this, please ignore this email.",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=False,
                )
            except Exception as e:
                # Log error in production or development
                print(f"Error sending password reset email: {e}")

        # Always return success response to prevent email enumeration
        return Response(
            {"message": "If this email is registered, a verification code has been sent."},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    """
    POST /api/v1/auth/password-reset/confirm/
    Verifies code and updates user's password.
    """

    permission_classes = [permissions.AllowAny]
    authentication_classes = []  # Bypass JWT verification

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower().strip()
        code = serializer.validated_data["code"].strip()
        new_password = serializer.validated_data["new_password"]

        # Check if there is a matching unexpired code (15 minutes expiry)
        expiry_time = timezone.now() - timedelta(minutes=15)
        reset_code = PasswordResetCode.objects.filter(
            email=email, code=code, created_at__gte=expiry_time
        ).first()

        if not reset_code:
            return Response(
                {"error": "Invalid or expired verification code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Retrieve user
        user = User.objects.filter(email=email).first()
        if not user:
            return Response(
                {"error": "User matching this email was not found."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Set new password
        user.set_password(new_password)
        user.save()

        # Delete all reset codes for this email
        PasswordResetCode.objects.filter(email=email).delete()

        return Response(
            {"message": "Password reset successful. You can now login with your new password."},
            status=status.HTTP_200_OK,
        )

