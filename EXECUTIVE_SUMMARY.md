# VocabCycle – Executive Summary

**Tagline:** "Learn • Review • Remember"

VocabCycle is a fast, SaaS-style web app to help users memorize vocabulary (especially for IELTS/GRE/SAT). Users learn 20 new words/day and review them using a Learning Cycle Engine + Review Queue.

---

## Project Vision & Goals

* **Vision:** Make vocabulary learning and retention effortless through structured cycles and reviews.
* **Goals:** Build a fast, responsive, and production-ready web app that users can deploy for free. Ensure a smooth UX: quick login (Google or email), intuitive daily cycles, progress tracking, and reliable reminders. Focus on scalability and maintainability (clean code, clear APIs, and containerized deployment).

---

## Tech Stack & Architecture

* **Frontend:** Next.js (React) v16+ with TypeScript, Tailwind CSS, and shadcn/ui components. Uses App Router for pages/layouts, and context/hooks for state (auth, user data, cycles).
* **Backend/API:** Django 5 + Django REST Framework (DRF). Uses JWT for stateless auth (e.g. `djangorestframework-simplejwt`).
* **Database:** Neon (Serverless Postgres) - free plan allows 100 projects, 100 CU-hours/project, 0.5 GB storage/project, up to 2 compute units. Auto-scales and supports branching.
* **Media/Storage:** Cloudinary (free tier for hosting profile images).
* **Email:** Resend via django-anymail integration. Used to send reminder emails.
* **Authentication:** Google OAuth2 + classic email/password. Uses Django Allauth or dj-rest-auth.
* **Scheduler:** GitHub Actions for daily reminders. Runs at 11:00 PM Dhaka time (cron) to trigger the Django API and send emails via Resend.
* **Hosting (Free-tier):**
  * *Frontend:* Vercel (Hobby plan, $0/mo).
  * *Backend:* Koyeb Free Instance (0.1 vCPU, 512 MB RAM, 2 GB SSD). Scales to zero after 1hr idle. Alternatively, Northflank Developer Sandbox.
* **DNS/SSL:** Cloudflare Free plan – use CNAME records for subdomains (e.g., `vocabcycle.rawsyst.com` -> Vercel, `api.vocabcycle.rawsyst.com` -> Koyeb).
* **Security:** Use HTTPS everywhere. Enforce `ALLOWED_HOSTS`, CORS rules, input validation (DRF serializers), and rate-limiting (DRF throttling). JWT tokens expire, and HTTPS-only cookies.

---

## Folder Structure (Monorepo)

```
/project-root
├── backend/               # Django project
│   ├── app/               # Django app (models, views, serializers)
│   ├── project/           # Django project settings, URLs
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.sample        # example environment vars
└── frontend/              # Next.js project
    ├── app/               # Next.js App Router (if using app/) or pages/
    ├── components/        # shared UI components
    ├── lib/               # hooks, API clients
    ├── public/            # static assets (favicon, images)
    ├── tailwind.config.js
    ├── next.config.js
    ├── package.json
    └── .env.local         # Next.js env vars (API URLs, etc)
```

---

## Learning Cycle Engine & Review Queue

* **Pattern:** Each Learning Cycle introduces 20 new words (word + meaning required; synonym/antonym optional). After entering 20 words, the user reviews them 7–10 times. Then the cycle marks complete.
* **Next Cycle (2–6):** User adds another 20 new words and reviews all words from the previous cycle 7–10 times. (Each cycle 2–6 consists of "20 new + review last cycle".)
* **Full Review Cycles:** Cycle 7 has no new words. Instead, all words learned in cycles 1–6 are reviewed 7–10 times. Cycles numbered multiples of 7 (7, 14, 21, etc.) are full-review cycles.
* **Missed-Day Logic:** Learning cycles are sequence-based, not date-based. If a day is missed, no cycle is skipped. (e.g., if the user completed cycle 5 on March 2, then missed March 3–4, they’ll start cycle 6 on March 5). A daily streak is tracked, but learning resumes where left off.
* **Calendar & Streaks:** Show streaks and completed cycles by date on a calendar in the UI.
* **Review Queue UI:** After words are entered, the app shows a review screen. Provide filters ("Show 5/10/15/20") so users can review either a subset or all words. Only once a cycle’s reviews reach $\ge 7$ times do we mark it complete.

---

## Vocabulary Input & Review UX

* **Input Flow:** On each learning day, the user enters 20 words. The UI shows 4 rows of 5 fields ("Word", "Meaning", "Synonym (opt)", "Antonym (opt)") and a "Next" button.
* **Review Screen:** Show a list of words with toggles or grouping (5/10/15/20). Display a running counter (e.g., "Review round 4 of 7"). Shuffle words or allow random order. Once $\ge 7$ passes complete, allow moving to the next cycle.

---

## Authentication & Profile

* **Login:** Register/login with Google OAuth2 or email/password.
* **Profile:** Store name, email, profile_pic URL, and email_verified. Users can edit profile.
* **Notification Setting:** A boolean `reminder_on` in profile. Default to ON; user can toggle off in Settings.

---

## Progress & Statistics Pages

* **Dashboard:** Shows total vocab learned, current cycle, words left today, percentage of daily goal (e.g. "12/20"), and current streak.
* **History:** A page listing past cycles with date completed, number of words, status. Each entry links to review that cycle's words.
* **Statistics:** Charts (weekly/monthly total words learned, longest streak, average reviews per word).
* **Search:** Global search box to look up any word in the database (returns definitions, synonyms).
* **Export (optional):** Export vocabulary list as JSON/CSV.

---

## Reminder System (GitHub Actions)

* Schedule a GitHub Actions workflow to run daily at 11:00 PM Dhaka time (`cron: '0 17 * * *'`).
* The action hits a Django API endpoint (`POST /api/v1/reminders/send/`) which checks which users have incomplete practice for the day, and sends reminder emails via Resend.

---

## Database Schema

### Users
* `id` (UUID PK)
* `name` (varchar)
* `email` (varchar, unique)
* `password_hash` (varchar, nullable if Google)
* `profile_pic` (varchar URL)
* `email_verified` (bool)
* `reminder_on` (bool)
* `created_at` (datetime)

### Vocabularies
* `id` (UUID PK)
* `user_id` (FK -> Users)
* `word` (varchar)
* `meaning` (text)
* `synonyms` (text, optional JSON/CSV)
* `antonyms` (text, optional)
* `introduced_cycle` (int)
* `created_at` (datetime)

### Cycles
* `id` (UUID PK)
* `user_id` (FK -> Users)
* `cycle_number` (int)
* `full_review` (bool)
* `started_at` (datetime)
* `completed_at` (datetime)

### Reviews
* `id` (UUID PK)
* `cycle_id` (FK -> Cycles)
* `vocabulary_id` (FK -> Vocabularies)
* `review_count` (int)
* `last_reviewed` (datetime)

---

## REST API Endpoints (under /api/v1/)

* **Auth:**
  * `POST /api/v1/auth/google/`
  * `POST /api/v1/auth/login/`
  * `POST /api/v1/auth/register/`
* **User:**
  * `GET /api/v1/user/`
  * `PUT /api/v1/user/`
  * `PUT /api/v1/user/settings/` (toggle reminders)
* **Vocabulary/Cycles:**
  * `GET /api/v1/vocab/` - list user's words
  * `POST /api/v1/vocab/` - add new words (bulk create 20)
  * `GET /api/v1/cycles/` - list cycles
  * `POST /api/v1/cycles/complete/` - mark cycle complete
  * `GET /api/v1/cycles/{id}/words/` - get words in a cycle
  * `POST /api/v1/reviews/` - record a review pass
* **Stats & Search:**
  * `GET /api/v1/stats/`
  * `GET /api/v1/search?word=...`

---

## UI Pages (Next.js Routes)

* `/` – Landing / Redirect
* `/login` – Login page
* `/signup` – Email signup
* `/dashboard` – Main dashboard
* `/cycle/[id]` – Cycle detail/review page
* `/history` – List of past cycles
* `/stats` – Progress charts
* `/profile` – Edit profile
* `/settings` – Account settings

---

## Environment Variables

* `SECRET_KEY`
* `DEBUG`
* `ALLOWED_HOSTS`
* `DATABASE_URL`
* `GOOGLE_CLIENT_ID`
* `GOOGLE_CLIENT_SECRET`
* `CLOUDINARY_URL`
* `RESEND_API_KEY`
* `FRONTEND_URL`
* `BACKEND_URL`
* `JWT_SECRET`
