<div align="center">

<img src="public/favicon.svg" alt="CropMedic AI Logo" width="80" height="80" />

# 🌿 CropMedic AI

**Smart Crop Disease Diagnosis & Agricultural Intelligence Platform**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Groq](https://img.shields.io/badge/Groq_AI-F55036?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[Report a Bug](https://github.com/Hamzaiftikhar01/Cropex/issues) · [Request a Feature](https://github.com/Hamzaiftikhar01/Cropex/issues)

</div>

---

## 📖 Overview

**CropMedic AI** is an AI-powered agricultural intelligence platform tailored for farmers and agronomists in Pakistan and beyond. It combines cutting-edge vision AI with real-time weather data and rule-based agronomic logic to deliver actionable, context-aware crop health decisions — right from your phone or browser.

Upload a photo of a diseased leaf, and CropMedic will:
- **Identify** the disease and crop type using a Groq-hosted LLM vision model
- **Prescribe** specific chemical treatments, preventive measures, and field actions
- **Advise** on irrigation, disease risk, and yield forecast based on your field profile and live weather
- **Guide** you through crop calendars and best practices in your language

---

## ✨ Features

### 🔬 AI Disease Diagnosis
- Upload a leaf image for **instant AI-powered crop disease identification**
- Powered by **Qwen/Qwen3.8-27b** via [Groq's ultra-fast inference API](https://groq.com/)
- Returns: crop type, disease name, confidence score, severity level, visible symptoms, likely causes, and recommended treatment actions
- Supports **PDF report export** via jsPDF + html2canvas

### 🌦️ Real-Time Weather Intelligence
- Integrates with the [Open-Meteo API](https://open-meteo.com/) for live forecasts
- Displays temperature, rainfall, humidity, wind speed, and 7-day outlook
- Weather data is **district-aware** — coordinates fetched per user's field district

### 🧑‍🌾 AI Farm Advisor (Two-Layer Architecture)
- **Layer 1 — Deterministic Priority Ladder**: Rule-based engine calculates disease risk, irrigation urgency, and yield forecast from field profile + weather data
- **Layer 2 — LLM Rephraser**: Groq LLM reformulates the deterministic verdict into natural, friendly farm advice in the user's selected language
- Graceful fallback: if Layer 2 times out, Layer 1's verdict is rendered directly via local translations — **advice is never dropped**

### 📊 Yield Forecasting
- Predictive yield estimates based on crop type, soil type, sowing date, and weather trends
- Visual indicators for growth stage and expected harvest window

### 🗺️ Crop Guides
- Comprehensive crop-specific planting calendars, care schedules, and best practice guides
- Field profile-aware recommendations

### 🤖 AI Chatbot
- Floating conversational assistant powered by Groq
- Context-aware: passes active field profile and weather data for personalized answers

### 📁 Field Profile Management
- Save multiple field profiles (crop type, district, soil type, sowing date, irrigation history)
- Profiles synced to **Supabase** for authenticated users; stored in `localStorage` for guests

### 🕘 Scan History
- Last 15 diagnosis scans saved per user
- Authenticated users: history synced to Supabase cloud
- Guest users: history persisted in `localStorage`

### 🌐 Multilingual Support
- Full i18n support via a central translations file
- Supports **English (en)**, **Urdu (ur)**, and **Punjabi (pa)** with automatic RTL layout switching

### 🌙 Dark / Light Mode
- Persistent theme preference via `localStorage`
- Applied before first paint — **zero FOUC** (Flash of Unstyled Content)

### 📱 Progressive Web App (PWA)
- Installable on mobile and desktop via `vite-plugin-pwa`
- Offline-capable app shell

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) + `@tailwindcss/typography` |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **AI / LLM** | [Groq API](https://groq.com/) — Qwen3.8-27b (vision + chat) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL + Auth) |
| **Weather** | [Open-Meteo](https://open-meteo.com/) (free, no-key API) |
| **PDF Export** | [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas](https://html2canvas.hertzen.com/) |
| **Markdown Rendering** | [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm) |
| **PWA** | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- A free **Groq API key** → [console.groq.com/keys](https://console.groq.com/keys)
- A free **Supabase** project → [supabase.com](https://supabase.com) *(optional — guest mode works without it)*

### 1. Clone the Repository

```bash
git clone https://github.com/Hamzaiftikhar01/Cropex.git
cd Cropex
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
# Required — get your key at https://console.groq.com/keys
VITE_GROQ_API_KEY=your_groq_api_key_here

# Optional — only needed for account-based features (auth + cloud history)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note:** The app works in **guest mode** without Supabase. All data is stored locally in your browser.

### 4. Run the Development Server

```bash
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🗄️ Database Setup (Optional)

To enable authenticated accounts and cloud-synced scan history, seed your Supabase project:

1. Go to your Supabase project → **SQL Editor**
2. Paste and run the contents of [`supabase_seed.sql`](supabase_seed.sql)

This creates the `profiles` and `analysis_history` tables with the correct schema and Row Level Security (RLS) policies.

---

## 📁 Project Structure

```
Cropex/
├── public/                  # Static assets (favicon, icons, PWA manifest)
├── api/                     # Serverless API routes (Vercel)
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── UploadCard.jsx
│   │   ├── AnalysisResult.jsx
│   │   ├── Chatbot.jsx
│   │   ├── FieldProfileSelector.jsx
│   │   ├── HistoryList.jsx
│   │   ├── SettingsModal.jsx
│   │   ├── AdvisorCard.jsx
│   │   ├── dashboard/       # Dashboard sub-components
│   │   ├── guides/          # Crop guide sub-components
│   │   └── icons/
│   ├── pages/               # Top-level view components (routed by App.jsx)
│   │   ├── DashboardView.jsx
│   │   ├── DiseaseView.jsx
│   │   ├── WeatherView.jsx
│   │   ├── YieldView.jsx
│   │   ├── CropGuideView.jsx
│   │   └── AuthView.jsx
│   ├── services/
│   │   ├── aiService.js     # Groq API client + disease identification logic
│   │   └── farmAdvisor.js   # Two-layer AI Farm Advisor engine
│   ├── hooks/
│   │   └── useWeatherData.js
│   ├── context/
│   │   └── LanguageContext.jsx
│   ├── lib/
│   │   ├── supabase.js
│   │   └── referenceData.js
│   ├── utils/
│   │   └── agriRules.js     # Deterministic agronomic rule engine
│   ├── locales/
│   │   └── translations.js  # i18n strings (en / ur / pa)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── scripts/                 # Utility/build scripts
├── reports/                 # Generated analysis reports
├── .env.example             # Environment variable template
├── vite.config.js
├── vercel.json
└── supabase_seed.sql        # Database schema & seed
```

---

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the production bundle |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## 🔑 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GROQ_API_KEY` | ✅ Yes | Groq API key for LLM inference |
| `VITE_SUPABASE_URL` | ⚠️ Optional | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ⚠️ Optional | Supabase anonymous public key |

> **Security:** Never commit your `.env` file. It is already listed in `.gitignore`.

---

## 🌍 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Hamzaiftikhar01/Cropex)

1. Click the button above or import the repo at [vercel.com/new](https://vercel.com/new)
2. Add your environment variables (`VITE_GROQ_API_KEY`, etc.) in the Vercel dashboard
3. Deploy — Vercel auto-detects Vite and configures the build

### Deploy to Netlify

```bash
npm run build
# Drag and drop the `dist/` folder to netlify.com/drop
```

---

## 🤝 Contributing

Contributions are warmly welcomed!

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to your branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

Please ensure your code passes `npm run lint` before submitting.

---

## 🐛 Known Issues & Limitations

- Camera capture on mobile is browser-permission-dependent
- Weather data falls back to cached/degraded mode if Open-Meteo is unreachable
- Supabase RLS must be configured correctly for multi-user deployments (see `supabase_seed.sql`)

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## 🙏 Acknowledgements

- [Groq](https://groq.com/) for blazing-fast LLM inference
- [Supabase](https://supabase.com/) for the open-source Firebase alternative
- [Open-Meteo](https://open-meteo.com/) for free, no-key weather APIs
- [Lucide](https://lucide.dev/) for the beautiful icon set
- [Vite](https://vitejs.dev/) for the lightning-fast build tooling

---

<div align="center">

Made with ❤️ for Pakistan's farmers

**[⭐ Star this repo](https://github.com/Hamzaiftikhar01/Cropex)** if you find it useful!

</div>
