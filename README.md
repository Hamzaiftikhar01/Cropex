# 🌾 Cropex — Your AI Farming Companion & Smart Agriculture Ecosystem

> **Predict Early. Protect Crops. Empower Farmers.**

Cropex is a complete **AI-powered smart farming platform** designed to help farmers predict crop diseases, reduce losses, improve yields, and make better farming decisions. Built specifically with local contexts in mind, Cropex provides early warnings by combining disease risk prediction, agricultural weather intelligence, smart irrigation scheduling, yield forecasting, localized crop guides, and an interactive multi-lingual AI chatbot.

---

## 🚀 Key Modules & System Features

### 1. Explainable AI Active Risks (Outbreak Warnings)
* Calculates crop-specific disease outbreak risks (e.g., Late Blight for tomato/potato, Rust for wheat, Blast for rice) before visible symptoms damage foliage.
* Computes risk thresholds dynamically based on real-time Open-Meteo weather APIs (7-day average temperatures, precipitation, and relative humidity).

### 2. Interactive Smart Irrigation Scheduler
* Tracks exactly how many days have passed since the last irrigation and forecasts future water needs based on the exact growth stage of the crop.
* A visual status timeline that shifts from "Fresh" to "Drying" to "Critical".
* An interactive "Mark as Irrigated Today" button that instantly updates the field profile and resets the agricultural models across the entire dashboard.

### 3. Intelligent Agricultural Weather Advisor
* Integrates coordinate-calibrated weather forecasts using real-time Open-Meteo API data.
* Highlights maximum temperatures, UV index, soil moisture, and Evapotranspiration (ET0).

### 4. Yield Forecasting
* Models expected harvest yields (maunds/acre) using a robust calculation engine.
* Applies weights for sowing window alignments, temperature stresses, soil texture parameters, and current disease risk factors.

### 5. Localized Crop Guides & AI Chatbot
* Features an extensive encyclopedia of localized crop cycles and practical farming tips.
* Includes a floating AI Chatbot (powered by Groq / Llama / GPT-OSS models) capable of answering real-time agricultural questions based on the farmer's specific field context.

### 6. Fully Multi-Lingual Interface
* Supports deep localization in **English, Urdu, and Punjabi (Shahmukhi script)**.
* Translates UI elements, crop names, disease states, and AI reasoning dynamically.

### 7. Supabase Authentication & History
* Secure user authentication and cloud-synced profiles via **Supabase**.
* Maintains a continuous history of disease scans and diagnostic results tied to the user's account.

---

## 🛠️ Unified System Flow

```text
                  REAL-WORLD ENVIRONMENT DATA
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
         Weather             Soil &            Farming
         Forecasts           Profiles          Actions (e.g. Irrigation)
            │                  │                  │
            └──────────────────┼──────────────────┘
                               │
                       CROPEX AGRI RULES
                               │
             ┌─────────────────┴─────────────────┐
             │                                   │
         Outbreaks                             Yields
             │                                   │
             └──────────────────┬─────────────────┘
                                │
                          ADVISOR ENGINE
                                │
             ┌─────────────────┴─────────────────┐
             │                                   │
      Dashboard UI                          AI Chatbot
```

---

## 📂 Project Structure

```text
├── src/
│   ├── components/
│   │   ├── AdvisorCard.jsx            # AI priority action card with urgency flags
│   │   ├── Chatbot.jsx                # Floating AI Chatbot interface (Groq LLM)
│   │   ├── Navbar.jsx                 # Main navigation and language switcher
│   │   ├── dashboard/
│   │   │   └── IrrigationSchedulerWidget.jsx # Interactive irrigation visualizer
│   │   └── guides/                    # UI components for detailed crop guides
│   ├── context/
│   │   └── LanguageContext.jsx        # Custom i18n hook supporting EN, UR, PA
│   ├── locales/
│   │   └── translations.js            # Comprehensive vocabulary dictionaries
│   ├── pages/
│   │   ├── AuthView.jsx               # Supabase login/signup and profile onboarding
│   │   ├── DashboardView.jsx          # Primary dashboard with 4 core intelligence modules
│   │   ├── DiseaseView.jsx            # Diagnostic scanner and result history
│   │   ├── WeatherView.jsx            # Extended 7-day meteorological data
│   │   ├── CropGuideView.jsx          # Localized crop tips and timelines
│   │   └── YieldView.jsx              # Harvest prediction statistics
│   ├── services/
│   │   └── aiService.js               # Groq LLM integration and localized advice generation
│   ├── utils/
│   │   ├── agriRules.js               # Outbreak risk formulas, ETc tracking, yield math
│   │   └── cropGuidesData.js          # Hardcoded encyclopedic crop cycle data
│   ├── App.jsx                        # Global router, Supabase auth sync, state management
│   ├── index.css                      # Tailwind v4 configuration and dark mode variables
│   └── main.jsx                       # React entry script
├── supabase_seed.sql                  # Database schema for profiles and history
├── package.json                       # Dependencies (React, Tailwind v4, Supabase JS, etc)
```

---

## ⚙️ Installation & Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **Groq API Key**: Obtain a key from the [Groq Console](https://console.groq.com/keys).
* **Supabase Project**: Obtain your URL and Anon Key.

### Setup Web Client
Clone the repository, install packages, and boot the hot-reloading development server:

```bash
# Clone the repository
git clone https://github.com/Hamzaiftikhar01/Crop-Medic-Ai.git
cd Crop-Medic-Ai

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env and add:
# VITE_GROQ_API_KEY=your_key_here
# VITE_SUPABASE_URL=your_url_here
# VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Run the development environment
npm run dev
```

---

## 🎨 Design System
Cropex employs a sleek, modern UI utilizing **Tailwind CSS v4**. 
- **Dark Mode Support**: Fully integrated dark mode utilizing CSS variables defined in `@layer base` for instant, lag-free theme switching.
- **Glassmorphism & Micro-animations**: Soft shadows, rounded interfaces, and hover effects make the platform feel alive and responsive.
- **Aesthetic Data Visualization**: Clean, dependency-free CSS-based progress bars and timelines for maximum performance.

---

## ⚖️ Legal Disclaimer
Cropex is an AI-powered prototype demonstrating smart decision-support concepts using simplified agronomic models. Recommendations are illustrative and do not replace professional agricultural extension services or on-site agronomist inspections.
