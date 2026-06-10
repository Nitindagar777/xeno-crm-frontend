# xeno-crm-frontend

A data-dense, dark-themed Single Page Application (SPA) built with React 18 and Vite for the **AI-Native Mini CRM**. It enables marketers to manage customers, build rule-based segments, trigger messaging campaigns, track real-time delivery statistics, and interact with the AI Campaign Agent.

---

## 🎨 Design System & Technologies
This interface is optimized for speed, visual appeal, and ease of use:
- **Core Framework**: React 18 + Vite (super-fast hot module replacement)
- **Styling**: Tailwind CSS + Framer Motion (smooth transition animations and micro-interactions)
- **State & Data Fetching**: TanStack Query (React Query v5) for client-side caching, automated polling, and background updates.
- **Analytics Charts**: Recharts (responsive delivery/performance charts)
- **Icons & Alerts**: Lucide React + React Hot Toast for instant notifications.

---

## ✨ Features
1. **Interactive Dashboard**: View high-level metrics (total revenue, customer counts, campaign counts) alongside revenue timelines.
2. **Customer Directory**: View profiles, order counts, search by name/details, and perform **bulk CSV imports** for rapid customer ingestion.
3. **Segment Rule Builder**: Interface to manually construct query conditions (e.g. city matches, purchase spend thresholds).
4. **Campaign Monitor**: Track campaigns as they run, watch live delivery charts (pie charts showing Sent vs Delivered vs Opened vs Read vs Clicked vs Failed), and browse detailed communication logs.
5. **Gemini AI Campaign Agent**: Slide-in assistant panel that suggests target segments, generates email/SMS templates, and asks for approval. You can view the agent's multi-step planning, edit suggested rules, and deploy campaigns directly from the chat.
6. **Actionable AI Insights**: Real-time analysis card showcasing churn risk groups, inactive buyers, and one-time purchaser segments with one-click campaign prompts.

---

## ⚙️ Local Development Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **Running Backend API**: The `crm-backend` server must be running on port `5000` (or configured URL).

### Setup Steps
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```
   Specify your API backend URL and optionally your Google Client ID if using OAuth:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```
3. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` (or the console output URL) in your browser.

---

## 🏗️ Folder Structure Highlights
- `/src/api` — API clients using Axios with token injection interceptors.
- `/src/components/layout` — Persistent navigation sidebar, header, and main container shell.
- `/src/components/agent` — Chat container, thinking cards, and structured approval widgets.
- `/src/components/campaigns` — Delivery stat visualizations and communication log table grids.
- `/src/pages` — View layouts for Dashboard, Customers, Segments, Campaigns, and Authentication.
- `/src/context` — React context providers for user auth and AI agent drawer control.
