<div align="center">

<img src="public/favicon.svg" alt="Cropex Logo" width="80" height="80" />

# 🌿 Cropex

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

**Cropex** is an AI-powered agricultural intelligence platform tailored for farmers and agronomists in Pakistan and beyond. It combines cutting-edge vision AI with real-time weather data and rule-based agronomic logic to deliver actionable, context-aware crop health decisions — right from your phone or browser.

Upload a photo of a diseased leaf, and Cropex will:
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

## 🗺️ Roadmap — Cropex to a Usable AI Product

> *Principle: build an evaluation set first, fix security, and only then train. Don't fine-tune anything until you've measured how far the current VLM falls short.*

---

### ✅ Phase 1 — Make It Safe & Shippable *(Week 1)*

- [ ] Move all Groq calls to `api/` serverless routes, use a non-`VITE_` env var, rotate the key, and add rate limiting + per-user quotas
- [ ] Compress images client-side before upload; validate file type and size
- [ ] Clean the repo (stray JSON, preview, and `dev-dist` files), add CI (lint + build), and deploy a live demo
- [ ] Add a clear disclaimer in the UI and the README

---

### 🔬 Phase 2 — Diagnosis Quality *(Weeks 2–4)*

| Step | Action |
|------|--------|
| **Scope** | Pick 5–6 crops that matter locally (wheat, rice, cotton, sugarcane, maize, tomato) and ~5 diseases each |
| **Benchmark** | Collect 300–500 real field photos, labeled/reviewed by an agronomist, kept as a held-out test set |
| **Baseline** | Score the current VLM zero-shot on this set |
| **Classifier** | Fine-tune a lightweight model (EfficientNet, MobileNet, or ConvNeXt-tiny) on PlantVillage + PlantDoc + field images |
| **Hybrid pipeline** | Classifier returns top-k + calibrated confidence → VLM explains and cross-checks → low confidence triggers "retake photo" or expert escalation |
| **Export** | ONNX or TFLite for faster inference and possible offline use. Training fits on free Colab / Kaggle GPUs |

> ⚠️ PlantVillage is lab-style — models that score 99% on it often fail in real fields. **Your own field data is the key ingredient.**

---

### 📚 Phase 3 — RAG Knowledge Base *(Weeks 3–5)*

- **Sources:** PARC/NARC bulletins, provincial agriculture department advisories, university extension material, and the Department of Plant Protection's registered pesticide lists
- **Pipeline:** Chunk by crop → disease → section · Embed with a multilingual model (`bge-m3` or `multilingual-e5`) · Store in **Supabase pgvector** (already in use) · Hybrid search (BM25 + vectors) · Handle Urdu queries
- **Safety rules:** Answers must cite sources and come only from retrieved text. If nothing is retrieved → *"consult an extension officer"*
- **Evaluation:** Golden set of ~100 Q&A pairs, checking retrieval hit rate and faithfulness

---

### 🌾 Phase 4 — Stronger Advisor Engine *(Weeks 4–6)*

- Keep the deterministic layer, but back thresholds with literature (e.g. humidity/temperature windows for late blight and rust) and test against past outbreak seasons
- **Yield model:** Train gradient boosting on district crop statistics + historical weather (Open-Meteo / ERA5) · Show a **range**, not a single number · Keep rules as fallback

---

### 🧪 Phase 5 — Treatment Safety

- Recommend only chemicals from the **registered pesticide list**
- Quote doses from the label or retrieved source — **never let the LLM invent doses**
- Show confidence and severity with every recommendation
- Add a *"talk to an expert"* escalation path for serious or uncertain cases

---

### 📱 Phase 6 — Farmer Usability *(Weeks 6–8)*

- **Urdu voice input and output** — many users have low literacy
- **WhatsApp bot front end** (photo in → diagnosis out) — likely more reachable than a web app
- **Low-bandwidth mode** with offline queue
- **SMS / push alerts** for district-level outbreak risk

---

### 🔄 Phase 7 — Feedback Loop & MLOps *(Ongoing)*

- Log scans with user consent; let users confirm or correct the diagnosis; add an agronomist review queue
- Use confirmed labels for **periodic retraining**
- Track accuracy per crop and per disease
- Monitor cost, latency, and failure rates

---

### 🎯 Success Targets

| Metric | Target |
|--------|--------|
| Top-1 accuracy on field test set | ≥ 85% |
| Top-3 accuracy on field test set | ≥ 95% |
| Median response time | < 5 seconds |
| Unsourced dosage advice | Zero |
| Pilot users | 10–20 real farmers or extension workers |

---

### ⚠️ Biggest Risks

| Risk | Mitigation |
|------|-----------|
| Insufficient field data | Partner with local agronomists; use data augmentation |
| Hallucinated treatments | RAG + registered pesticide list guard |
| API cost at scale | Move to self-hosted / ONNX model; add quotas |

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
