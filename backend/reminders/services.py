"""
Reminders app – Email reminder service.

Sends reminder emails to users who haven't completed today's vocabulary
practice and have reminders enabled.
"""

import zoneinfo
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.utils import timezone

from vocabulary.models import Cycle

User = get_user_model()


class ReminderService:
    """Handles sending daily reminder emails."""

    @staticmethod
    def get_users_needing_reminder():
        """
        Find users who:
        1. Have reminder_on = True and reminder_hour = current_hour
        2. Have not completed a cycle today (no completed_at with today's date)
        3. Have at least one cycle (i.e., they've used the app before)
        """
        dhaka_tz = zoneinfo.ZoneInfo("Asia/Dhaka")
        now_dhaka = timezone.now().astimezone(dhaka_tz)
        today = now_dhaka.date()
        current_hour = now_dhaka.hour

        # Users with reminders enabled for the current hour
        active_users = User.objects.filter(
            reminder_on=True,
            reminder_hour=current_hour,
            is_active=True,
        )

        users_needing_reminder = []
        for user in active_users:
            # Check if user has any cycles at all
            has_cycles = Cycle.objects.filter(user=user).exists()
            if not has_cycles:
                continue

            # Check if user completed a cycle today
            completed_today = Cycle.objects.filter(
                user=user,
                completed_at__date=today,
            ).exists()

            if not completed_today:
                users_needing_reminder.append(user)

        return users_needing_reminder

    @staticmethod
    def send_reminder_email(user):
        """Send a reminder email to a single user."""
        frontend_url = settings.FRONTEND_URL
        subject = "📚 VocabCycle – Don't forget your daily vocabulary!"
        message = (
            f"Hi {user.name or 'there'},\n\n"
            f"You haven't completed today's vocabulary practice yet!\n\n"
            f"Complete 20 words to keep your streak going. 🔥\n\n"
            f"👉 {frontend_url}/dashboard\n\n"
            f"Keep learning,\n"
            f"VocabCycle Team\n\n"
            f"---\n"
            f"To disable these reminders, go to Settings in your VocabCycle app."
        )

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            return True
        except Exception as e:
            # Log the error but don't crash
            print(f"Failed to send reminder to {user.email}: {e}")
            return False

    @classmethod
    def send_all_reminders(cls):
        """
        Send reminder emails to all eligible users.

        Returns:
            dict with 'total_users', 'sent', 'failed' counts.
        """
        users = cls.get_users_needing_reminder()
        sent = 0
        failed = 0

        for user in users:
            if cls.send_reminder_email(user):
                sent += 1
            else:
                failed += 1

        return {
            "total_users": len(users),
            "sent": sent,
            "failed": failed,
        }
