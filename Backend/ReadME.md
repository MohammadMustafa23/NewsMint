# ⚙️ NewsMint — Backend

The backend engine that powers **NewsMint** — an AI-driven, personalized, bilingual (English + Hindi) news aggregation and delivery platform. This service handles everything from fetching raw news to summarizing it with AI and delivering it straight to users on Telegram, fully automated, every single day.

> 🔗 Frontend client: see [`Frontend/newsMint`](https://github.com/MohammadMustafa23/NewsMint/tree/main/Frontend/newsMint)

---

## 🧠 What This Backend Actually Does

NewsMint isn't just an API wrapper — it's a full automated news intelligence pipeline. In short:

**Source → Collection → Database → AI Summarization → Personalization → Scheduling → Telegram Delivery**

1. **Collects** fresh news every day from external APIs/RSS sources
2. **Understands** each article using Gemini (LLM) to generate clean summaries in **English and Hindi**
3. **Remembers** user preferences — categories, language, delivery time
4. **Delivers** a personalized digest straight to each user's Telegram, right on schedule

Users set their preferences once. The backend does the repetitive work of finding, filtering, understanding, and delivering relevant news — every day, automatically.

---

## 🏗️ Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  News APIs  │ --> │  Ingestion   │ --> │    Database      │
│   / RSS     │     │  (6 AM Cron) │     │ (articles, tags) │
└─────────────┘     └──────────────┘     └─────────┬────────┘
                                                     │
                                                     ▼
                                          ┌──────────────────────┐
                                          │  AI Processing Layer  │
                                          │  (Gemini / LLM)       │
                                          │  EN + HI summaries    │
                                          └──────────┬────────────┘
                                                     │
                                                     ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Telegram  │ <-- │  Digest      │ <-- │  Scheduler        │
│   Delivery  │     │  Formatter   │     │  (runs every min) │
└─────────────┘     └──────────────┘     └─────────────────┘
                             ▲
                             │
                    ┌─────────────────┐
                    │  User Prefs      │
                    │  (categories,    │
                    │  language, time) │
                    └─────────────────┘
```

The system is deliberately split into independent responsibilities — fetching, AI processing, user management, scheduling, and delivery — so each piece can evolve and scale on its own.

---

## ✨ Core Features

| Feature                         | Description                                                                       |
| ------------------------------- | --------------------------------------------------------------------------------- |
| 📡 **Automated news ingestion** | Daily cron job (~6:00 AM) fetches and normalizes articles from configured sources |
| 🤖 **AI summarization**         | Gemini/LLM generates structured, human-readable summaries in English & Hindi      |
| ♻️ **No duplicate processing**  | Processed content is cached/stored so articles are never re-summarized            |
| 🔐 **OTP-based authentication** | Secure signup/login with OTP verification                                         |
| 🎯 **Personalization**          | Users choose categories, language, and delivery time                              |
| ⏱️ **Per-minute scheduler**     | Checks every user's configured delivery time and triggers digests precisely       |
| 📲 **Telegram delivery**        | Formatted digests sent directly via Telegram bot integration                      |
| ⚡ **Redis / Upstash Redis**    | Fast-access layer for OTPs, sessions, caching, and temporary state                |
| 🗄️ **Persistent database**      | Source of truth for users, articles, categories, summaries, and preferences       |

---

## 🛠️ Tech Stack

> Update version numbers/exact libraries to match your `package.json` / requirements file.

| Layer            | Technology                                         |
| ---------------- | -------------------------------------------------- |
| Runtime          | Node.js                                            |
| Database         | (e.g. MongoDB / PostgreSQL — confirm)              |
| Cache / Sessions | Redis (Upstash)                                    |
| AI / LLM         | Google Gemini                                      |
| Scheduling       | Cron jobs (daily ingestion) + per-minute scheduler |
| Messaging        | Telegram Bot API                                   |
| Auth             | OTP-based verification                             |

---

## 📁 Project Structure

```
Backend/
├── src/
│   ├── controllers/       # Route handlers (auth, users, preferences, digest)
│   ├── services/          # Business logic (news fetch, AI processing, delivery)
│   ├── jobs/               # Cron job + scheduler logic
│   ├── models/             # Database schemas (User, Article, Category, Summary)
│   ├── utils/               # Helpers (Redis client, Telegram client, formatters)
│   ├── routes/              # API route definitions
│   └── app.js                # App entry point
├── .env.example
├── package.json
└── README.md
```

_(Adjust this tree to reflect the actual folder layout in your repo.)_

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/MohammadMustafa23/NewsMint.git
cd NewsMint/Backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```env
# Database
DATABASE_URL=your_database_connection_string

# Redis / Upstash
REDIS_URL=your_upstash_redis_url

# AI
GEMINI_API_KEY=your_gemini_api_key

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# News Sources
NEWS_API_KEY=your_news_api_key

# Auth
JWT_SECRET=your_jwt_secret
OTP_EXPIRY_MINUTES=5
```

### 4. Run the server

```bash
npm run dev
```

### 5. Run background jobs (if separated from the main server)

```bash
npm run jobs
```

---

## 🔄 The Daily Pipeline

| Step             | Trigger               | What Happens                                                          |
| ---------------- | --------------------- | --------------------------------------------------------------------- |
| 1️⃣ Ingestion     | Daily cron (~6:00 AM) | Fetch, normalize, and store fresh articles with categories/tags       |
| 2️⃣ AI Processing | After ingestion       | Gemini generates EN + HI summaries, stored to avoid reprocessing      |
| 3️⃣ Scheduling    | Every minute          | Checks which users' delivery time has arrived                         |
| 4️⃣ Matching      | Per user              | Loads user's categories + language, finds matching processed articles |
| 5️⃣ Formatting    | Per user              | Builds a clean, readable digest                                       |
| 6️⃣ Delivery      | Per user              | Sends digest via Telegram                                             |

---

## 🧪 Production Hardening — Known Focus Areas

This project has gone through backend audits with attention to real production concerns, including:

- Redis JSON serialization/deserialization correctness
- API response caching strategy
- Persisting verified Telegram connections reliably
- Preference-save behavior and edge cases
- Telegram connection status tracking
- Full category coverage in the digest formatter
- Reliable digest delivery via locking / claim / history mechanisms (to prevent duplicate or missed sends)

This reflects an ongoing effort to move the project from "working demo" to **reliable, production-grade backend architecture**.

---

## 🗺️ Roadmap

- [ ] Add more news source integrations
- [ ] Add delivery channels beyond Telegram (email, WhatsApp)
- [ ] Add admin dashboard for monitoring digest delivery health
- [ ] Add automated retry mechanism for failed deliveries
- [ ] Add analytics on article engagement per category

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source. Add your preferred license here (e.g., MIT).

---

## 👤 Author

**Mohammad Mustafa**
GitHub: [@MohammadMustafa23](https://github.com/MohammadMustafa23)

---

⭐ If you find this project useful, consider giving it a star on GitHub!
