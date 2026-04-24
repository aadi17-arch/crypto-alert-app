# 🚀 CryptoAlert: High-Precision Financial Terminal

A professional-grade cryptocurrency price monitoring dashboard designed with a high-contrast terminal aesthetic. Built for speed, clarity, and real-time responsiveness.

## ✨ Key Features
- **Real-Time Polling**: Automatic market data updates every 60 seconds.
- **Smart Alerts**: Set precision targets (Above/Below) for any asset.
- **Live Notifications Hub**: Unified "History" and "Active Monitors" tabbed interface.
- **Institutional Design**: Typography-first UI using *Plus Jakarta Sans* and *Roboto Mono*.
- **Cloud Persistence**: Securely save your monitors across devices using Google Firebase.
- **Mobile Optimized**: Fully responsive layout for on-the-go monitoring.

## 🏗️ Technical Architecture
- **Frontend**: React.js (Hooks & Context)
- **Database**: Cloud Firestore (Real-time listeners)
- **Auth**: Firebase Google Authentication
- **Market Data**: CoinGecko API
- **Styling**: Vanilla CSS (High-contrast finance theme)

## 📁 Project Structure
- `/src/App.js`: Core logic, price monitoring, and global state.
- `/src/App.css`: Unified design system and terminal styling.
- `/src/firebase.js`: Firebase configuration and service layer.
- `/src/components/`: Modular UI components (Header, Table, Hub, Toast).

## 🚦 Getting Started
1. Install dependencies: `npm install`
2. Configure `.env.local` with your Firebase credentials.
3. Start the terminal: `npm run dev`

---
*Developed with a focus on High-Contrast Visibility and Institutional Aesthetics.*
