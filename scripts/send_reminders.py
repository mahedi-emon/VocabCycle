#!/usr/bin/env python3
import os
import sys
import json
import urllib.request
import urllib.parse
from datetime import datetime
import zoneinfo

def main():
    database_url = os.environ.get("DATABASE_URL")
    resend_api_key = os.environ.get("RESEND_API_KEY")
    frontend_url = os.environ.get("FRONTEND_URL", "https://vocabcycle.rawsyst.com")
    default_from_email = os.environ.get("DEFAULT_FROM_EMAIL", "noreply@vocabcycle.rawsyst.com")

    if not database_url:
        print("Error: DATABASE_URL environment variable is missing.", file=sys.stderr)
        sys.exit(1)
    if not resend_api_key:
        print("Error: RESEND_API_KEY environment variable is missing.", file=sys.stderr)
        sys.exit(1)

    # Determine current hour and date in Asia/Dhaka
    dhaka_tz = zoneinfo.ZoneInfo("Asia/Dhaka")
    now_dhaka = datetime.now(dhaka_tz)
    current_hour = now_dhaka.hour
    today = now_dhaka.date().isoformat()

    print(f"[{datetime.now().isoformat()}] Starting reminders run for: Date={today}, Hour={current_hour} (Dhaka Time)")

    # Connect to PostgreSQL database using psycopg2
    try:
        import psycopg2
    except ImportError:
        print("Error: psycopg2-binary not installed. Run 'pip install psycopg2-binary' first.", file=sys.stderr)
        sys.exit(1)

    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
    except Exception as e:
        print(f"Error connecting to database: {e}", file=sys.stderr)
        sys.exit(1)

    # SQL query to find users needing a reminder
    # 1. Active users with reminder enabled and matching scheduled reminder hour
    # 2. Who have at least one cycle recorded
    # 3. Who have NOT completed any cycle today
    query = """
        SELECT id, email, name FROM users 
        WHERE reminder_on = true 
          AND reminder_hour = %s 
          AND is_active = true
          AND EXISTS (
              SELECT 1 FROM cycles WHERE cycles.user_id = users.id
          )
          AND NOT EXISTS (
              SELECT 1 FROM cycles 
              WHERE cycles.user_id = users.id 
                AND cycles.completed_at::date = %s
          );
    """

    try:
        cursor.execute(query, (current_hour, today))
        users = cursor.fetchall()
        print(f"Found {len(users)} user(s) needing a study reminder for hour {current_hour}.")
    except Exception as e:
        print(f"Database query failed: {e}", file=sys.stderr)
        cursor.close()
        conn.close()
        sys.exit(1)

    cursor.close()
    conn.close()

    if not users:
        print("No users to remind at this hour. Exiting.")
        sys.exit(0)

    # Send reminder emails using Resend REST API
    sent_count = 0
    failed_count = 0

    resend_url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {resend_api_key}",
        "Content-Type": "application/json"
    }

    for user_id, email, name in users:
        user_name = name or "there"
        subject = "📚 VocabCycle – Don't forget your daily vocabulary!"
        body_text = (
            f"Hi {user_name},\n\n"
            f"You haven't completed today's vocabulary practice yet!\n\n"
            f"Complete 20 words to keep your streak going. 🔥\n\n"
            f"👉 {frontend_url}/dashboard\n\n"
            f"Keep learning,\n"
            f"VocabCycle Team\n\n"
            f"---\n"
            f"To disable these reminders, go to Settings in your VocabCycle app."
        )

        email_data = {
            "from": f"VocabCycle <{default_from_email}>",
            "to": [email],
            "subject": subject,
            "text": body_text
        }

        # Call Resend REST API via urllib
        try:
            req = urllib.request.Request(
                resend_url, 
                data=json.dumps(email_data).encode("utf-8"), 
                headers=headers,
                method="POST"
            )
            with urllib.request.urlopen(req) as response:
                res_body = response.read().decode("utf-8")
                print(f"Successfully sent reminder to {email}. Resend response: {res_body}")
                sent_count += 1
        except Exception as e:
            print(f"Failed to send email to {email}: {e}", file=sys.stderr)
            failed_count += 1

    print(f"Reminder execution finished. Sent: {sent_count}, Failed: {failed_count}")

if __name__ == "__main__":
    main()
