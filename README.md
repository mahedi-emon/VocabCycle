# 📚 VocabCycle

**Master IELTS, GRE & SAT Vocabulary with Structured Spaced Repetition**

[![Live App](https://img.shields.io/badge/🌐_Live_App-vocabcycle.rawsyst.com-6C63FF?style=for-the-badge)](https://vocabcycle.rawsyst.com)

[![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel&logoColor=white&style=flat-square)](https://vocabcycle.rawsyst.com)
[![Northflank](https://img.shields.io/badge/Backend-Northflank-FF4F8B?logo=northflank&logoColor=white&style=flat-square)](https://vocabcycle.rawsyst.com)
[![Neon Postgres](https://img.shields.io/badge/Database-Neon_Postgres-00E599?logo=postgresql&logoColor=white&style=flat-square)](https://neon.tech)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs&logoColor=white&style=flat-square)](https://nextjs.org)
[![Django](https://img.shields.io/badge/Django-5.0_/_DRF-092E20?logo=django&logoColor=white&style=flat-square)](https://www.django-rest-framework.org)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white&style=flat-square)](https://www.python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white&style=flat-square)](https://www.docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 🎯 What is VocabCycle?

VocabCycle is a **production-ready, SaaS-style vocabulary acquisition platform** built for students preparing for **IELTS, GRE, SAT, TOEFL, and PTE** exams.

Instead of random flashcards, VocabCycle uses a **sequence-based learning cycle engine** with **completion-based spaced repetition** — you learn exactly **20 new words daily**, review them at least **7 times per cycle**, and every **7th cycle** triggers a full-review milestone covering all previous words.

> 💡 **Key Insight:** Missed days never break your sequence. VocabCycle picks up exactly where you left off.

---

## ⚡ Key Features

| Feature | Description |
|---------|-------------|
| 🔄 **20-Word Daily Cycles** | Add words with meanings, synonyms & antonyms in a clean 4×5 grid |
| 📊 **7-Round Spaced Repetition** | Review each word set at least 7 times before completing a cycle |
| 🏆 **Full Review Milestones** | Every 7th cycle consolidates all words from the previous 6 cycles |
| 🔐 **Google OAuth + Email Auth** | Secure JWT-based sessions with automatic token refresh |
| 📧 **Smart Email Reminders** | Configurable daily reminders via Resend, triggered by GitHub Actions |
| 📈 **Statistics Dashboard** | Streaks, word counts, cycle history, and progress tracking |
| ⚡ **Instant Loading** | Cache-first UI pattern — dashboard loads in < 1ms from localStorage |
| 🌙 **Premium Dark Mode** | Glassmorphic design with micro-animations throughout |

---

## 🏗 System Architecture

```mermaid
graph TD
    A([👤 Browser]) -->|HTTPS| B[Vercel CDN / Next.js 15]
    B -->|API Calls| C[Northflank Gateway]
    C -->|Gunicorn| D[Django 5 / DRF API]
    D -->|SQL| E[(Neon Serverless Postgres)]
    D -->|SMTP| F[Resend Email API]
    G[⏰ GitHub Actions Cron] -->|Webhook| D
    
    style A fill:#6C63FF,color:#fff,stroke:none
    style B fill:#000,color:#fff,stroke:#333
    style D fill:#092E20,color:#fff,stroke:none
    style E fill:#00E599,color:#000,stroke:none
    style F fill:#FF6B6B,color:#fff,stroke:none
    style G fill:#2088FF,color:#fff,stroke:none
```

---

## 📂 Project Structure

```
vocabcycle/
├── 📁 .github/workflows/       # Hourly reminder cron + CI/CD
├── 📁 backend/                  # Django 5 REST API
│   ├── accounts/                # Auth, User model, Google OAuth, Password Reset
│   ├── vocabulary/              # Words, Cycles engine, Reviews, Stats, Search
│   ├── reminders/               # Email reminder service
│   ├── project/                 # Settings (base/dev/prod), URLs, middleware
│   ├── Dockerfile               # Production container config
│   ├── gunicorn.conf.py         # WSGI server tuning
│   └── requirements.txt         # Python dependencies
└── 📁 frontend/                 # Next.js 15 + TypeScript
    ├── app/                     # App Router (pages, layouts, auth routes)
    ├── components/              # Sidebar, Header, Footer, Forms
    ├── contexts/                # AuthContext with cache-first loading
    ├── lib/                     # API client, type definitions
    └── tailwind.config.ts       # Design system tokens
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ & **npm** v10+
- **Python** v3.10+
- **PostgreSQL** (or a [Neon](https://neon.tech) database URL)

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:
```env
SECRET_KEY=your-secret-key
DATABASE_URL=postgres://user:pass@host:5432/dbname
GOOGLE_CLIENT_ID=your-google-client-id
RESEND_API_KEY=re_your_api_key
REMINDER_SECRET_TOKEN=your-reminder-secret
```

```bash
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

```bash
npm run dev     # → http://localhost:3000
```

---

## 🔌 API Reference

All endpoints return JSON. Protected routes require `Authorization: Bearer <token>`.

### 🔓 Authentication (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register/` | Create new account |
| `POST` | `/api/v1/auth/login/` | Email/password login → JWT |
| `POST` | `/api/v1/auth/google/` | Google OAuth token exchange |
| `POST` | `/api/v1/auth/password-reset/request/` | Request 6-digit reset code |
| `POST` | `/api/v1/auth/password-reset/confirm/` | Confirm reset with code |

### 👤 User Profile (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/user/` | Get user profile |
| `PUT` | `/api/v1/user/` | Update profile & preferences |
| `PUT` | `/api/v1/user/settings/` | Toggle reminder on/off |
| `POST` | `/api/v1/user/change-password/` | Change password |

### 📖 Vocabulary & Cycles (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/vocab/` | List all vocabulary words |
| `POST` | `/api/v1/vocab/` | Add new words (up to 20) |
| `GET` | `/api/v1/vocab/export/` | Export as CSV/JSON |
| `GET` | `/api/v1/cycles/` | List all cycles |
| `GET` | `/api/v1/cycles/current/` | Current active cycle |
| `POST` | `/api/v1/cycles/start/` | Start new cycle |
| `POST` | `/api/v1/cycles/complete/` | Complete active cycle |
| `POST` | `/api/v1/reviews/` | Record a review pass |
| `GET` | `/api/v1/stats/` | Learning statistics |
| `GET` | `/api/v1/search/?word=<q>` | Search vocabulary |

---

## ⚙ Performance Optimizations

VocabCycle is tuned for **free-tier cloud containers** (0.1 vCPU / 256MB RAM):

| Optimization | Impact |
|---|---|
| **Custom PBKDF2 Hasher** (12K iterations vs default 260K) | **20x faster** password validation |
| **Static Gunicorn Workers** (2 workers, no dynamic scaling) | RAM stays under **90MB idle** |
| **Cache-First UI Loading** (localStorage → background fetch) | Dashboard renders in **< 1ms** |
| **Public Endpoint JWT Bypass** (`authentication_classes = []`) | Eliminates stale-token 401 errors |

---

## 🔒 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🧑‍💻 Author

<table>
  <tr>
    <td>
      <strong>Mahedi Hasan Emon</strong><br/>
      <em>Full-Stack Engineer & UI/UX Designer</em>
    </td>
  </tr>
  <tr>
    <td>
      🌐 <a href="https://www.mahedihasanemon.site/">Portfolio</a> · 
      💼 <a href="https://www.linkedin.com/in/mahediemon/">LinkedIn</a> · 
      🐙 <a href="https://github.com/mahedi-emon">GitHub</a> · 
      📧 <a href="mailto:mahedi.emon62@gmail.com">Email</a>
    </td>
  </tr>
</table>

---

## 🏢 Built by RawSyst IT

<table>
  <tr>
    <td>
      <strong>RawSyst IT</strong><br/>
      <em>Custom Software Development & IT Solutions</em>
    </td>
  </tr>
  <tr>
    <td>
      🌐 <a href="https://www.rawsyst.com/">rawsyst.com</a> · 
      📧 <a href="mailto:rawsystit@gmail.com">rawsystit@gmail.com</a>
    </td>
  </tr>
</table>

---

<div align="center">
  <br/>
  <strong>⭐ Star this repository if VocabCycle helps you learn!</strong>
  <br/><br/>
  <a href="https://vocabcycle.rawsyst.com">
    <img src="https://img.shields.io/badge/Try_VocabCycle_Now-6C63FF?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIgM2g2YTQgNCAwIDAgMSA0IDR2MTRhMyAzIDAgMCAwLTMtM0gyeiIvPjxwYXRoIGQ9Ik0yMiAzaC02YTQgNCAwIDAgMC00IDR2MTRhMyAzIDAgMCAxIDMtM2g3eiIvPjwvc3ZnPg==&logoColor=white" alt="Try VocabCycle" />
  </a>
</div>
