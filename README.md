# 📚 VocabCycle – Enterprise Spaced-Repetition Vocabulary Engine

[![Vercel Deployment](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel&logoColor=white&style=flat-square)](https://vocabcycle.rawsyst.com)
[![Northflank Deployment](https://img.shields.io/badge/Backend-Northflank-FF4F8B?logo=northflank&logoColor=white&style=flat-square)](https://api.vocabcycle.rawsyst.com)
[![Neon DB](https://img.shields.io/badge/Database-Neon--Postgres-00E599?logo=postgresql&logoColor=white&style=flat-square)](https://neon.tech)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs&logoColor=white&style=flat-square)](https://nextjs.org)
[![Django DRF](https://img.shields.io/badge/Django-5.0_/_DRF-092E20?logo=django&logoColor=white&style=flat-square)](https://www.django-rest-framework.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

VocabCycle is a production-ready, SaaS-style vocabulary acquisition and retention platform specifically optimized for **IELTS, GRE, and SAT preparation**. Leveraging a structured **sequence-based learning cycle engine** and **completion-based spaced repetition**, VocabCycle makes vocabulary acquisition effortless and highly retention-efficient.

Live App: **[vocabcycle.rawsyst.com](https://vocabcycle.rawsyst.com)**  
API Endpoint: **[api.vocabcycle.rawsyst.com](https://api.vocabcycle.rawsyst.com)**

---

## ⚡ Key Features

*   **100% Responsive Next.js 15 App**: Sleek dark mode design, glassmorphic UI widgets, and smooth micro-animations.
*   **Google OAuth2 & Email Password Sign-In**: Powered by secure JWT stateless sessions with automatic token refresh.
*   **Optimistic Client Caching**: Near-zero load times using localStorage caching for user profile and statistics.
*   **Spaced Repetition & Milestone Engines**:
    *   **20-Word Daily Cycles**: Add 20 target words with definitions, synonyms, and antonyms in a smart 4×5 grid.
    *   **7-Round Retain checks**: Review cycles at least 7 times to lock the vocabulary.
    *   **Every 7th Cycle Full-Review**: Switch automatically to a consolidate mode covering all words from the previous 6 cycles.
*   **Configurable Hourly Email Reminders**: Daily notifications via **Resend (Anymail)** triggered automatically by **GitHub Actions** cron schedulers. Configurable hour and timezone toggle directly from the Profile settings dashboard.
*   **Detailed Statistics & History**: Streak counters, word list exports, search engine lookups, and visual charts.

---

## 🏗 System Architecture

```mermaid
graph TD
    User([Browser / Client]) -->|Next.js App| Frontend[Vercel Frontend Server]
    Frontend -->|HTTPS API Requests| Gate[Northflank Gateway]
    Gate -->|Gunicorn Workers| Backend[Django API Server]
    Backend -->|Neon Driver| DB[(Neon Postgres Serverless)]
    Backend -->|SMTP/API| Resend[Resend Email Gateway]
    GH[GitHub Actions Cron Runner] -->|Hourly Scheduled Webhook| Backend
```

---

## 📂 Monorepo Structure

```
/vocabcycle
├── .github/workflows/   # CI/CD & Automated Hourly Reminder Workflow
├── backend/             # Django 5 API Application
│   ├── accounts/        # Authentication, Custom User Model, Passwords & Reminders
│   ├── vocabulary/      # Vocab entries, Cycles engine, Reviews & Statistics
│   ├── project/         # Core settings, URL routing & middleware configurations
│   ├── requirements.txt # Python packages dependencies list
│   └── Dockerfile       # Containerized production deployment configuration
└── frontend/            # Next.js 15 Client Web Application
    ├── app/             # App Router pages, auth sub-routes & layouts
    ├── components/      # Global layout headers, sidebars, forms & widgets
    ├── contexts/        # Auth context, state caching providers
    ├── lib/             # API clients, axios configurations & TS interfaces
    └── tailwind.config.ts
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
*   Node.js v18.0+ & npm v10.0+
*   Python v3.10+
*   PostgreSQL or Neon database URL

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install package dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file from the sample config, updating your Neon database connection settings, Email keys, and Google OAuth credentials:
   ```env
   SECRET_KEY=dev-secret-key-change-in-production
   DATABASE_URL=postgres://user:password@localhost:5432/vocabcycle
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   RESEND_API_KEY=re_your_api_key
   REMINDER_SECRET_TOKEN=vocabcycle_daily_reminder_key_2026
   ```
5. Apply database migrations:
   ```bash
   python manage.py migrate
   ```
6. Run the local development server:
   ```bash
   python manage.py runserver
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Create a `.env.local` file and specify the API base host and Google Client ID:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   ```
4. Start the Next.js local development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000`.

---

## ⚙ Production Settings & Performance Hardening

VocabCycle is optimized for constrained hosting environments (e.g. 0.1 vCPU Sandbox containers) using:
*   **LightPBKDF2PasswordHasher**: Overridden Django password hashers to use 30,000 iterations instead of the default 260,000. This increases validation speed by **12x** on limited CPU cores without exhausting Gunicorn workers.
*   **Static Worker Threading**: Configured `gunicorn.conf.py` to launch exactly 2 workers to run comfortably within 256MB RAM boundaries.
*   **Client Caching**: SWR-inspired cache-first UI loading pattern that prevents layout shifts and rendering lag during Neon database cold starts.

---

## 🔒 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🧑‍💻 Author

**Mahedi Hasan Emon**
*   Portfolio: [mahedihasanemon.site](https://www.mahedihasanemon.site/)
*   LinkedIn: [@mahediemon](https://www.linkedin.com/in/mahediemon/)
*   GitHub: [@mahedi-emon](https://github.com/mahedi-emon)
*   Company: [RawSyst IT](https://www.rawsyst.com/)
