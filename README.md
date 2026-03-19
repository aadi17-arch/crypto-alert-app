# CryptoAlert
## Real-Time Cryptocurrency Price Alerts with Instant Notifications

CryptoAlert is a React + Firebase app that helps users monitor live crypto prices, create custom price alerts, and get notified when targets are reached.

## Features

- Real-time crypto price tracking for the top 50 coins
- Create custom price alerts with `above` and `below` conditions
- In-app toast notifications when alerts trigger
- Google OAuth authentication
- Firebase Firestore real-time sync
- Dark mode UI
- Mobile responsive layout
- Quick alert selection directly from crypto cards

## Tech Stack

- Frontend: React.js, JavaScript
- Authentication: Firebase Google Auth
- Database: Firebase Firestore
- API: CoinGecko
- Styling: CSS3
- Icons: React Icons
- HTTP: Axios

## Project Structure

```text
crypto-alert-app/
|-- public/
|   |-- favicon.svg               # Browser tab icon
|   `-- index.html                # HTML shell
|-- src/
|   |-- components/
|   |   |-- Header.js             # Header and auth controls
|   |   |-- CryptoList.js         # Crypto cards, search, sort, refresh
|   |   |-- PriceAlerts.js        # Alert form and alert list
|   |   `-- Toast.js              # Toast notifications
|   |-- contexts/
|   |   `-- AuthContext.js        # Legacy auth context
|   |-- App.js                    # Main app logic and state
|   |-- App.css                   # Global styling
|   |-- firebase.js               # Firebase config and helper exports
|   `-- index.js                  # App entry point
|-- firestore.rules               # Firestore security rules
|-- .env.example                  # Public env template
|-- .gitignore                    # Git ignore rules
|-- package.json                  # Scripts and dependencies
`-- README.md                     # Project documentation
```

## Getting Started

### Prerequisites

- Node.js
- npm
- Firebase account

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/aadi17-arch/crypto-alert-app.git
cd crypto-alert-app

# 2. Install dependencies
npm install

# 3. Create local environment file
# Windows PowerShell:
Copy-Item .env.example .env.local

# macOS/Linux:
# cp .env.example .env.local

# 4. Add your Firebase values to .env.local

# 5. Start the app
npm start
```

### Open the app

```text
http://localhost:3000
```

## How It Works

### 1. Price Fetching

The app fetches the top 50 cryptocurrencies from the CoinGecko API on a fixed interval and keeps a local map of current prices for fast alert checks.

### 2. Alert Creation

After signing in with Google, the user selects a cryptocurrency, sets a target price, and chooses whether the alert should trigger when the price goes above or below that target.

### 3. Alert Checking

The app compares each saved alert against the latest market price. If the condition matches, the alert status is updated from `active` to `triggered`.

### 4. Notifications

When an alert triggers, the app shows an in-app toast notification so the user gets immediate feedback inside the app.

### 5. Authentication

Authentication uses Firebase Google Sign-In. User-specific alerts are stored in Firestore and loaded in real time.

## Database Schema

### Firestore Collection: `alerts`

```json
{
  "userId": "string",
  "cryptoId": "string",
  "cryptoName": "string",
  "targetPrice": 65000,
  "condition": "above",
  "status": "active",
  "createdAt": "timestamp",
  "triggeredAt": null
}
```

## Security

- Firestore rules restrict users to their own alerts
- Firebase config uses environment variables
- Google Auth protects user access

### Firestore Rules

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /alerts/{alertId} {
      allow read: if request.auth != null
                  && resource.data.userId == request.auth.uid;

      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid
                    && request.resource.data.cryptoId is string
                    && request.resource.data.targetPrice is number
                    && request.resource.data.condition in ['above', 'below']
                    && request.resource.data.status in ['active', 'triggered', 'dismissed'];

      allow update: if request.auth != null
                    && resource.data.userId == request.auth.uid
                    && request.resource.data.userId == resource.data.userId
                    && request.resource.data.cryptoId == resource.data.cryptoId
                    && request.resource.data.targetPrice == resource.data.targetPrice;

      allow delete: if request.auth != null
                    && resource.data.userId == request.auth.uid;
    }
  }
}
```

## Screenshots / Demo

- [Screenshot of Header]
- [Screenshot of Crypto List]
- [Screenshot of Alerts]

## Deployment

### Deploy to Vercel

```bash
vercel login
vercel
```

### Vercel Steps

1. Link the project to GitHub
2. Choose the repository: `crypto-alert-app`
3. Framework preset: `Create React App`
4. Build command: `npm run build`
5. Output directory: `build`

### Add Environment Variables

Go to:

```text
Vercel Dashboard -> Project -> Settings -> Environment Variables
```

Add the values from your local `.env.local`, then redeploy.

## Performance Metrics

- Market refresh interval: 60 seconds
- Real-time Firestore sync for alerts
- Query scoped by `userId` for alert loading
- Lightweight single-page React frontend

## Known Limitations

- CoinGecko free API has rate limits
- Free Firestore tier has usage limits
- Firebase authorized domains must be configured for each deployment domain

## Future Improvements

- Email notifications
- Historical charts
- Portfolio tracking
- Mobile app
- ML-based predictions

## Learning Outcomes

- React Hooks for state and side effects
- Firebase Authentication and Firestore integration
- API polling and alert logic
- UI/UX iteration and responsive design

## License

MIT License

## Author

- Name: Adi
- GitHub: https://github.com/aadi17-arch
- LinkedIn: https://www.linkedin.com/in/aditya-shankar-lal

## Acknowledgments

- CoinGecko API
- Firebase
- React community
