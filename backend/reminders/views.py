"""
Reminders app – Views for triggering reminder emails.
Protected by a secret token to prevent unauthorized access.
"""

from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import ReminderService


class SendRemindersView(APIView):
    """
    POST /api/v1/reminders/send/
    Triggered by GitHub Actions daily cron job.
    Protected by REMINDER_SECRET_TOKEN header.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Validate the secret token
        token = request.headers.get("X-Reminder-Token", "")
        expected_token = settings.REMINDER_SECRET_TOKEN

        if not expected_token or token != expected_token:
            return Response(
                {"error": "Unauthorized."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        result = ReminderService.send_all_reminders()

        return Response(
            {
                "message": "Reminder job completed.",
                "details": result,
            },
            status=status.HTTP_200_OK,
        )
