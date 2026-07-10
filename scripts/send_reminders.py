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

    # ── DIAGNOSTIC: Show all users with reminders enabled ──
    try:
        cursor.execute("""
            SELECT id, email, name, reminder_on, reminder_hour, is_active
            FROM users
            WHERE reminder_on = true AND is_active = true
            ORDER BY reminder_hour;
        """)
        all_reminder_users = cursor.fetchall()
        print(f"\n📋 Users with reminders ON: {len(all_reminder_users)}")
        for uid, email, name, r_on, r_hour, active in all_reminder_users:
            match_tag = " ◀ MATCH" if r_hour == current_hour else ""
            print(f"   • {email} | hour={r_hour} | active={active}{match_tag}")
    except Exception as e:
        print(f"WARNING: Diagnostic query failed: {e}")

    # ── DIAGNOSTIC: Check cycles for matching users ──
    try:
        cursor.execute("""
            SELECT u.email, u.reminder_hour,
                   (SELECT COUNT(*) FROM cycles c WHERE c.user_id = u.id) as total_cycles,
                   (SELECT COUNT(*) FROM cycles c WHERE c.user_id = u.id AND c.completed_at IS NOT NULL) as completed_cycles,
                   (SELECT MAX(c.completed_at) FROM cycles c WHERE c.user_id = u.id) as last_completed
            FROM users u
            WHERE u.reminder_on = true
              AND u.reminder_hour = %s
              AND u.is_active = true;
        """, (current_hour,))
        matching_users = cursor.fetchall()
        print(f"\n🔍 Users matching hour {current_hour}: {len(matching_users)}")
        for email, r_hour, total_c, completed_c, last_completed in matching_users:
            print(f"   • {email}")
            print(f"     total_cycles={total_c}, completed_cycles={completed_c}")
            print(f"     last_completed_at={last_completed}")
            if total_c == 0:
                print(f"     ⚠️  SKIPPED: No cycles found (user hasn't started learning)")
            elif last_completed:
                # Check if completed today in Dhaka timezone
                cursor.execute("""
                    SELECT EXISTS(
                        SELECT 1 FROM cycles
                        WHERE user_id = (SELECT id FROM users WHERE email = %s)
                          AND (completed_at AT TIME ZONE 'Asia/Dhaka')::date = %s
                    );
                """, (email, today))
                completed_today = cursor.fetchone()[0]
                if completed_today:
                    print(f"     ⚠️  SKIPPED: Already completed a cycle today ({today})")
                else:
                    print(f"     ✅ ELIGIBLE: Has cycles but hasn't completed one today")
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
