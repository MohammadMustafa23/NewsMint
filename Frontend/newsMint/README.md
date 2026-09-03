# 📰 NewsMint — Frontend

The frontend for **NewsMint**, an AI-powered personalized news platform that delivers clean, bilingual (English + Hindi) news summaries straight to users based on their interests — no endless scrolling, no information overload.

This is the client-side application users interact with to sign up, pick their favorite categories, set language and delivery preferences, connect Telegram, and manage their personalized news experience.

> 🔗 Backend / full project overview: see the main [NewsMint](https://github.com/MohammadMustafa23/NewsMint) repository.

---

## ✨ What This App Does

NewsMint's frontend gives users a simple control panel for their personalized news feed:

- 🔐 **Sign up & log in** with OTP-based verification
- 🗂️ **Choose news categories** (Tech, Business, Sports, Politics, etc.)
- 🌐 **Pick a language** — English or Hindi
- ⏰ **Set delivery preferences** — when and how you get your digest
- 📲 **Connect Telegram** to receive daily summaries directly in chat
- 👤 **Manage your profile** and update preferences anytime

Everything the user configures here feeds into the backend pipeline, which fetches news, summarizes it with AI, and delivers a personalized digest every day.

---

## 🛠️ Tech Stack

> Update this section with your exact stack/versions if they differ.

| Layer | Technology |
|---|---|
| Framework | React (Vite) |
| Styling | Tailwind CSS |
| State/Data | REST API calls to NewsMint backend |
| Auth | OTP-based verification |
| Notifications | Telegram Bot integration |

---

## 📁 Project Structure

```
newsMint/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # App pages (Login, Dashboard, Preferences, etc.)
│   ├── services/       # API calls to the backend
│   ├── assets/         # Images, icons, static files
│   └── App.jsx         # Root component
├── public/              # Static public assets
├── index.html
├── package.json
└── vite.config.js
```

*(Adjust this tree to match the actual folder layout in your repo.)*

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/MohammadMustafa23/NewsMint.git
cd NewsMint/Frontend/newsMint
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=your_backend_api_url
```

### 4. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in your terminal).

### 5. Build for production

```bash
npm run build
```

---

## 🔄 How It Connects to the Backend

```
User signs up → sets preferences (category, language, delivery time)
        ↓
Preferences saved to backend/database
        ↓
Backend fetches news daily (6 AM cron job) → AI summarizes in English & Hindi
        ↓
Scheduler checks each user's delivery time every minute
        ↓
Personalized digest sent via Telegram
```

The frontend is the entry point for all of this — every setting a user configures here directly shapes what news they receive and when.

---

## 🗺️ Roadmap

- [ ] Add dark mode
- [ ] Add push notifications (in addition to Telegram)
- [ ] Add saved/bookmarked articles view
- [ ] Improve mobile responsiveness
- [ ] Add multi-language UI (not just content language)

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