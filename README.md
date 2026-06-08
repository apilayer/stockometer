# StockoMeter

Track live stock prices, top gainers and losers, trading volume, and price history across thousands of tickers — all in one clean, fast dashboard. Powered by APILayer's [Marketstack API](https://marketstack.com/).

## 🚀 Features

- **Live Market Data:** Real-time stock prices, volume, and changes across global exchanges.
- **Stock Screener:** Advanced filtering by price, volume, sector, and exchange.
- **Portfolio Tracker:** Track your holdings in real-time. Data is stored securely in your browser (`localStorage`) — no login required.
- **Price Alerts:** Set target prices and get notified with browser alerts when your target is hit.
- **Embeddable Widgets:** Generate lightweight, iframe-able stock cards for blogs and third-party websites. Supports dark/light themes.
- **Stock Comparison:** Compare up to 6 stocks side-by-side with interactive historical charts.
- **Dividends & Earnings Calendars:** SEO-optimized data tools tracking upcoming earnings reports and dividend payouts.
- **Responsive & Dark Mode:** Clean, fast, mobile-ready UI with automatic dark mode.

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand (for Watchlist, Alerts, and Portfolio)
- **Charts:** Custom in-house SVG charts — interactive candlesticks with zoom/pan, no third-party charting library
- **Icons:** Lucide React
- **Data Provider:** Marketstack API
- **Logos:** Logo.dev API

## 💻 Getting Started

### Prerequisites
1. Node.js 18+ and `npm` installed.
2. A free API key from [Marketstack](https://marketstack.com/).
3. A free API key from [Logo.dev](https://www.logo.dev/) (for company logos).

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/heyOnuoha/stockometer.git
   cd stockometer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   MARKETSTACK_API_KEY=your_marketstack_api_key_here
   NEXT_PUBLIC_LOGO_DEV_TOKEN=your_logodev_token_here
   
   # Optional cache revalidation times (in seconds)
   STOCKOMETER_LIST_REVALIDATE=65
   STOCKOMETER_HISTORY_REVALIDATE=3600
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔒 Security & Performance
StockoMeter is built with performance and security in mind:
- **Security Headers:** Enforces strict security policies (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`).
- **Safe Embeds:** Embed widget routes omit framing restrictions safely while sanitizing inputs.
- **Code Splitting:** Heavy client components (dashboards, charts) use `next/dynamic` to ensure rapid initial page loads.
- **UI Skeletons:** Animated loading skeletons prevent layout shift during SSR data fetching.

## 📄 License
This project is open-source and available under the MIT License.
