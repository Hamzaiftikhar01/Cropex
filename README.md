# 🌾 Cropex — Your AI Farming Companion & Smart Agriculture Ecosystem

> **Predict Early. Protect Crops. Empower Farmers.**

Cropex is a complete **AI-powered smart farming platform** designed to help farmers predict crop diseases, reduce losses, improve yields, and make better farming decisions. Rather than simply detecting diseases after visible damage occurs, Cropex provides early warnings by combining early disease risk prediction, agricultural weather intelligence, smart irrigation scheduling, yield forecasting, and multilingual voice assistance.

---

## 🚀 Key Modules & System Features

### 1. Proactive Disease Outbreak Prediction (Outbreak Warnings)
* Calculates crop-scoped disease outbreak risks (Late Blight for tomato/potato, Rust for wheat, Blast for rice) before visible symptoms damage foliage.
* Computes risk thresholds dynamically based on 7-day average temperatures and relative humidity variables.

### 2. Intelligent Agricultural Weather Advisor
* Integrates coordinate-calibrated weather forecasts using real-time Open-Meteo API data.
* Flags active regional alerts (frost, heatwaves, heavy rainfall) alongside actionable crop guidelines.

### 3. Smart Irrigation Scheduler
* Implements a water-budget logic adjusting crop demand relative to growth stage factors.
* Incorporates soil hydrodynamics (Sandy, Loamy, Clay) alongside evaporation multipliers and rain savings offsets to preserve aquifer reservoirs.

### 4. Explainable Yield Forecasting
* Models expected harvest yields (maunds/acre) using a transparent regression engine.
* Applies weights for sowing window alignments, temperature stresses, soil texture parameters, and disease risk factors.
* Clamps regression multipliers to a 0.60 floor to prevent unrealistic compounding stress drops.

### 5. Multilingual AI Assistant with Text-to-Speech (TTS)
* Supports full localizations in **English, Urdu, and Punjabi (Shahmukhi script)**.
* Integrated browser-native **Web Speech API (`speechSynthesis`)** that reads headlines and reasoning out loud. Uses standard Pakistani voices (`ur-PK` for Urdu/Punjabi and `en-US` for English) triggered strictly via user button gestures to bypass browser autoplay blocks.

---

## 🛠️ Unified System Flow

```text
                  REAL-WORLD ENVIRONMENT DATA
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
         Weather             Soil &            Farming
         Forecasts           Profiles          Actions
            │                  │                  │
            └──────────────────┼──────────────────┘
                               │
                       CROPEX AGRI RULES
                               │
             ┌─────────────────┴─────────────────┐
             │                                   │
         Outbreaks                             Yields
            │                                    │
            └──────────────────┬─────────────────┘
                               │
                         PRIORITY LADDER
                               │
                         ADVISOR ENGINE
                               │
             ┌─────────────────┴─────────────────┐
             │                                   │
         Dashboard                          Voice (TTS)
```

---

## 📂 Project Structure

```text
├── api/
│   ├── analyze.js             # Vercel serverless vision diagnostic proxy
│   └── rephrase.js            # Vercel serverless text rephraser proxy
├── data/
│   ├── diseaseIndex.json      # Offline crop-disease diagnostics database
│   └── products.json          # Scraped agricultural products catalog
├── src/
│   ├── components/
│   │   ├── About.jsx          # Smart ecosystem details
│   │   ├── AdvisorCard.jsx    # Prioritized urgency-coded AI card with TTS
│   │   ├── FieldProfileSelector.jsx # Switch presets (Wheat/Tomato/Cotton)
│   │   ├── Navbar.jsx         # Header containing 3-way language cycle selector
│   │   └── SettingsModal.jsx  # Dark/light theme & local storage controls
│   ├── context/
│   │   └── LanguageContext.jsx# Custom i18n hook supporting template parameters
│   ├── locales/
│   │   └── translations.js    # EN / UR / PA Shahmukhi vocabulary dictionaries
│   ├── pages/
│   │   ├── AuthView.jsx       # Bilingual login, signup, and profile onboarding
│   │   ├── DashboardView.jsx  # Automatic entry dashboard with visual loader
│   │   └── DiseaseView.jsx    # Diagnostic scanner with simulated demo scans
│   ├── services/
│   │   └── farmAdvisor.js     # Deterministic advisor engine & rephrase caller
│   ├── utils/
│   │   └── agriRules.js       # Outbreak risk formulas, irrigation limits, yield regression
│   ├── App.jsx                # Global router and auth session gates
│   └── main.jsx               # Entry script
```

---

## ⚙️ Installation & Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **Groq API Key**: Obtain a key from the [Groq Console](https://console.groq.com/keys).

### Setup Web Client
Clone the repository, install packages, and boot the hot-reloading development server:

```bash
# Clone the repository
git clone https://github.com/Hamzaiftikhar01/Crop-Medic-Ai.git
cd Crop-Medic-Ai

# Install dependencies
npm install

# Setup environment variables
# Add your GROQ API KEY as VITE_GROQ_API_KEY
cp .env.example .env

# Run the development environment
npm run dev
```

---

## 🧪 18-Point Combinatorial Verification Matrix

Before submitting the project, verify that the AI Advisor and Speech output render complete, correct, and localized text across all variables:

| Test | Profile Preset | Selected Language | Network State | Expected Priority Headline | Expected Urgency | TTS Voice |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | A (Wheat) | EN (English) | Online | General status | Low (🟢 Green) | en-US |
| **2** | A (Wheat) | UR (Urdu) | Online | General status | Low (🟢 Green) | ur-PK |
| **3** | A (Wheat) | PA (Punjabi) | Online | General status | Low (🟢 Green) | ur-PK (fallback) |
| **4** | A (Wheat) | EN (English) | Offline | General status | Low (🟢 Green) | en-US |
| **5** | A (Wheat) | UR (Urdu) | Offline | General status | Low (🟢 Green) | ur-PK |
| **6** | A (Wheat) | PA (Punjabi) | Offline | General status | Low (🟢 Green) | ur-PK (fallback) |
| **7** | B (Tomato) | EN (English) | Online | Disease (Late Blight) | High (🔴 Red) | en-US |
| **8** | B (Tomato) | UR (Urdu) | Online | Disease (Late Blight) | High (🔴 Red) | ur-PK |
| **9** | B (Tomato) | PA (Punjabi) | Online | Disease (Late Blight) | High (🔴 Red) | ur-PK (fallback) |
| **10**| B (Tomato) | EN (English) | Offline | Disease (Late Blight) | High (🔴 Red) | en-US |
| **11**| B (Tomato) | UR (Urdu) | Offline | Disease (Late Blight) | High (🔴 Red) | ur-PK |
| **12**| B (Tomato) | PA (Punjabi) | Offline | Disease (Late Blight) | High (🔴 Red) | ur-PK (fallback) |
| **13**| C (Cotton) | EN (English) | Online | Irrigation (Now) | High (🔴 Red) | en-US |
| **14**| C (Cotton) | UR (Urdu) | Online | Irrigation (Now) | High (🔴 Red) | ur-PK |
| **15**| C (Cotton) | PA (Punjabi) | Online | Irrigation (Now) | High (🔴 Red) | ur-PK (fallback) |
| **16**| C (Cotton) | EN (English) | Offline | Irrigation (Now) | High (🔴 Red) | en-US |
| **17**| C (Cotton) | UR (Urdu) | Offline | Irrigation (Now) | High (🔴 Red) | ur-PK |
| **18**| C (Cotton) | PA (Punjabi) | Offline | Irrigation (Now) | High (🔴 Red) | ur-PK (fallback) |

---

## ⚖️ Legal Disclaimer
Cropex is a hackathon prototype demonstrating smart decision-support concepts using simplified agronomic models. Recommendations are illustrative and do not replace professional agricultural extension services or on-site agronomist inspections.
