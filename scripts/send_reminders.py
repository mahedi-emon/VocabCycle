#!/usr/bin/env python3
"""
VocabCycle – Standalone Reminder Email Script
Runs via GitHub Actions cron. Connects directly to Neon Postgres,
finds users needing a reminder, and sends emails via Resend API.
"""

import os
import sys
import json
import urllib.request
from datetime import datetime
import zoneinfo


def main():
    database_url = os.environ.get("DATABASE_URL")
    resend_api_key = os.environ.get("RESEND_API_KEY")
    frontend_url = os.environ.get("FRONTEND_URL", "https://vocabcycle.rawsyst.com")
    default_from_email = os.environ.get("DEFAULT_FROM_EMAIL", "noreply@vocabcycle.rawsyst.com")

    if not database_url:
        print("ERROR: DATABASE_URL environment variable is missing.", file=sys.stderr)
        sys.exit(1)
    if not resend_api_key:
        print("ERROR: RESEND_API_KEY environment variable is missing.", file=sys.stderr)
        sys.exit(1)

    # ── Determine current hour and date in Asia/Dhaka ──
    dhaka_tz = zoneinfo.ZoneInfo("Asia/Dhaka")
    now_dhaka = datetime.now(dhaka_tz)
    current_hour = now_dhaka.hour
    today = now_dhaka.date().isoformat()

    print(f"{'='*60}")
    print(f"VocabCycle Reminder – {now_dhaka.strftime('%Y-%m-%d %I:%M %p')} (Dhaka)")
    print(f"Checking for users with reminder_hour = {current_hour}")
    print(f"Today's date (Dhaka): {today}")
    print(f"{'='*60}")

    # ── Connect to database ──
    try:
        import psycopg2
    except ImportError:
        print("ERROR: psycopg2-binary not installed.", file=sys.stderr)
        sys.exit(1)

    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        print("✅ Database connection successful.")
    except Exception as e:
        print(f"ERROR: Database connection failed: {e}", file=sys.stderr)
        sys.exit(1)

    # ── DIAGNOSTIC: Show ALL users with reminders enabled + their cycle info ──
    try:
        cursor.execute("""
            SELECT 
                u.id, u.email, u.name, u.reminder_hour, u.is_active,
                (SELECT COUNT(*) FROM cycles c WHERE c.user_id = u.id) as total_cycles,
                (SELECT COUNT(*) FROM cycles c WHERE c.user_id = u.id AND c.completed_at IS NOT NULL) as completed_cycles,
                (SELECT COUNT(*) FROM cycles c WHERE c.user_id = u.id 
                    AND (c.completed_at AT TIME ZONE 'Asia/Dhaka')::date = %s) as completed_today,
                (SELECT MAX(c.completed_at) FROM cycles c WHERE c.user_id = u.id) as last_completed
            FROM users u
            WHERE u.reminder_on = true AND u.is_active = true
            ORDER BY u.reminder_hour;
        """, (today,))
        all_users = cursor.fetchall()

        print(f"\n📋 Users with reminders ON: {len(all_users)}")
        print(f"{'-'*60}")
        for uid, email, name, r_hour, active, total_c, completed_c, completed_today_count, last_completed in all_users:
            hour_match = "✅ HOUR MATCH" if r_hour == current_hour else f"⏰ hour={r_hour} (waiting)"
            print(f"\n   👤 {email} ({name or 'No name'})")
            print(f"      reminder_hour = {r_hour} | {hour_match}")
            print(f"      total_cycles = {total_c} | completed_cycles = {completed_c}")
            print(f"      completed_today = {completed_today_count} | last_completed = {last_completed}")

            # Determine eligibility
            if r_hour != current_hour:
                print(f"      → SKIP: Hour doesn't match (need {r_hour}, got {current_hour})")
            elif total_c == 0:
                print(f"      → ⚠️ SKIP: User has NO cycles (hasn't started learning yet)")
            elif completed_today_count > 0:
                print(f"      → ⚠️ SKIP: Already completed a cycle today")
            else:
                print(f"      → ✅ ELIGIBLE: Will receive reminder email!")

    except Exception as e:
        print(f"WARNING: Diagnostic query failed: {e}")

    # ── Main query: Find users needing a reminder ──
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
                AND (cycles.completed_at AT TIME ZONE 'Asia/Dhaka')::date = %s
          );
    """

    try:
        cursor.execute(query, (current_hour, today))
        users = cursor.fetchall()
        print(f"\n{'='*60}")
        print(f"📨 Final eligible users to email: {len(users)}")
        for uid, email, name in users:
            print(f"   → {email}")
        print(f"{'='*60}")
    except Exception as e:
        print(f"ERROR: Main query failed: {e}", file=sys.stderr)
        cursor.close()
        conn.close()
        sys.exit(1)

    cursor.close()
    conn.close()

    if not users:
        print("No users to remind at this hour. Exiting.")
        sys.exit(0)

    # ── Send reminder emails using Resend REST API ──
    sent_count = 0
    failed_count = 0

    resend_url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {resend_api_key}",
        "Content-Type": "application/json",
    }

    for user_id, email, name in users:
        user_name = name or "there"
        subject = "\U0001f4da VocabCycle \u2013 Don\u2019t forget your daily vocabulary!"
        body_text = (
            f"Hi {user_name},\n\n"
            f"You haven't completed today's vocabulary practice yet!\n\n"
            f"Complete 20 words to keep your streak going. \U0001f525\n\n"
            f"\U0001f449 {frontend_url}/dashboard\n\n"
            f"Keep learning,\n"
            f"VocabCycle Team\n\n"
            f"---\n"
            f"To disable these reminders, go to Settings in your VocabCycle app."
        )

        email_data = {
            "from": f"VocabCycle <{default_from_email}>",
            "to": [email],
            "subject": subject,
            "text": body_text,
        }

        try:
            req = urllib.request.Request(
                resend_url,
                data=json.dumps(email_data).encode("utf-8"),
                headers=headers,
                method="POST",
            )
            with urllib.request.urlopen(req) as response:
                res_body = response.read().decode("utf-8")
                print(f"✅ Sent to {email} — Resend: {res_body}")
                sent_count += 1
        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8") if e.fp else "No response body"
            print(f"❌ Failed {email}: HTTP {e.code} — {error_body}", file=sys.stderr)
            failed_count += 1
        except Exception as e:
            print(f"❌ Failed {email}: {e}", file=sys.stderr)
            failed_count += 1

    print(f"\n{'='*60}")
    print(f"Finished. Sent: {sent_count}, Failed: {failed_count}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
