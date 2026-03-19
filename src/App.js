import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BsCurrencyBitcoin } from 'react-icons/bs';
import Header from './components/Header';
import CryptoList from './components/CryptoList';
import PriceAlerts from './components/PriceAlerts';
import Toast from './components/Toast';
import {
  signInWithGoogle,
  signOutUser,
  addAlertToFirestore,
  deleteAlertFromFirestore,
  updateAlertStatus,
  subscribeToUserAlerts,
  listenToAuthState
} from './firebase';
import './App.css';

const POLL_INTERVAL_MS = 60000;
const RETRY_DELAYS_MS = [1500, 4000];

function App() {
  const [user, setUser] = useState(null);
  const [cryptos, setCryptos] = useState([]);
  const [userAlerts, setUserAlerts] = useState([]);
  const [currentPrices, setCurrentPrices] = useState({});
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [cryptoError, setCryptoError] = useState(null);

  useEffect(() => {
    const unsubscribe = listenToAuthState((currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);

      if (!currentUser) {
        setUserAlerts([]);
        setSelectedCrypto(null);
      }
    });

    return unsubscribe;
  }, []);

  const fetchCryptos = useCallback(async (showRetryToast = false) => {
    const endpoint =
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50';

    setLoading(true);
    setCryptoError(null);

    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
      try {
        const response = await axios.get(endpoint, {
          timeout: 10000
        });

        const cryptoList = response.data.map((coin) => ({
          ...coin,
          cryptoId: coin.id,
          cryptoName: coin.name
        }));

        const priceMap = cryptoList.reduce((acc, coin) => {
          acc[coin.id] = coin.current_price;
          return acc;
        }, {});

        setCryptos(cryptoList);
        setCurrentPrices(priceMap);
        setLoading(false);

        if (showRetryToast) {
          setToast({ message: 'Crypto prices refreshed', type: 'success' });
        }

        return;
      } catch (error) {
        const statusCode = error.response?.status;
        const isLastAttempt = attempt === RETRY_DELAYS_MS.length;

        console.error('Failed to fetch crypto prices:', error);

        if (!isLastAttempt) {
          await new Promise((resolve) => {
            setTimeout(resolve, RETRY_DELAYS_MS[attempt]);
          });
          continue;
        }

        if (cryptos.length > 0) {
          setToast({
            message:
              statusCode === 429
                ? 'Rate limited by CoinGecko. Showing last updated prices.'
                : 'Refresh failed. Showing last updated prices.',
            type: 'info'
          });
          setLoading(false);
          return;
        }

        setCryptoError(
          statusCode === 429
            ? 'CoinGecko rate limit reached. Please wait a moment and try again.'
            : 'Failed to load cryptocurrency data. Please check your connection and try again.'
        );
        setLoading(false);
      }
    }
  }, [cryptos.length]);

  // Fetch the top 50 crypto prices every 60 seconds and keep both list and lookup data in sync.
  useEffect(() => {
    fetchCryptos();
    const interval = setInterval(fetchCryptos, POLL_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [fetchCryptos]);

  // Subscribe to the logged-in user's alerts so Firestore changes appear in real time.
  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const unsubscribe = subscribeToUserAlerts(user.uid, (alerts) => {
      setUserAlerts(alerts);
    });

    return unsubscribe;
  }, [user]);

  // Check active alerts against current prices and mark them triggered when a condition is met.
  useEffect(() => {
    if (!user || userAlerts.length === 0) {
      return;
    }

    userAlerts.forEach((alert) => {
      const alertKey = alert.cryptoId || alert.coinId;
      const currentPrice = currentPrices[alertKey];
      const alertCondition = String(alert.condition || '').toLowerCase();
      const targetPrice = Number(alert.targetPrice);

      if (currentPrice == null || Number.isNaN(targetPrice) || alert.status === 'triggered') {
        return;
      }

      const isAboveTriggered = alertCondition === 'above' && currentPrice > targetPrice;
      const isBelowTriggered = alertCondition === 'below' && currentPrice < targetPrice;

      if (isAboveTriggered || isBelowTriggered) {
        updateAlertStatus(alert.id, 'triggered').catch((error) => {
          console.error('Failed to update alert status:', error);
        });

        setToast({
          message: `${alert.cryptoName || alert.coinName} alert triggered!`,
          type: 'info'
        });
      }
    });
  }, [currentPrices, userAlerts, user]);

  const handleLogin = async () => {
    setIsAuthLoading(true);

    try {
      const loggedInUser = await signInWithGoogle();
      setUser(loggedInUser);
    } catch (error) {
      console.error('Login failed:', error);
      setToast({
        message: error.message || 'Login failed',
        type: 'error'
      });
    }

    setIsAuthLoading(false);
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      setUser(null);
      setUserAlerts([]);
      setSelectedCrypto(null);
    } catch (error) {
      console.error('Logout failed:', error);
      setToast({ message: 'Logout failed', type: 'error' });
    }
  };

  const handleAddAlert = async (formData) => {
    if (!user) {
      setToast({ message: 'Please sign in first', type: 'error' });
      return;
    }

    const selectedId = formData.cryptoId || formData.coinId;
    const selectedCoin = cryptos.find((coin) => coin.id === selectedId);
    const normalizedCondition =
      String(formData.condition || '').toLowerCase() === 'below' ? 'below' : 'above';

    const alertPayload = {
      cryptoId: selectedId,
      cryptoName: formData.cryptoName || selectedCoin?.name || '',
      targetPrice: Number(formData.targetPrice),
      condition: normalizedCondition
    };

    try {
      await addAlertToFirestore(user.uid, alertPayload);
      setToast({ message: 'Alert created!', type: 'success' });
    } catch (error) {
      console.error('Failed to create alert:', error);
      setToast({ message: 'Failed to create alert', type: 'error' });
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      await deleteAlertFromFirestore(alertId);
      setToast({ message: 'Alert deleted', type: 'success' });
    } catch (error) {
      console.error('Failed to delete alert:', error);
      setToast({ message: 'Failed to delete alert', type: 'error' });
    }
  };

  const handleSelectCrypto = (crypto) => {
    setSelectedCrypto(crypto);
    setToast({
      message: `${crypto.coinName} selected for a new alert`,
      type: 'info'
    });
  };

  if (!authChecked) {
    return (
      <div className="app-shell">
        <Header
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
          isLoading={isAuthLoading}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-shell">
        <Header
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
          isLoading={isAuthLoading}
        />
        <div className="login-page">
          <div className="login-card">
            <div className="login-logo">
              <BsCurrencyBitcoin size={34} />
            </div>
            <h1 className="login-title">CryptoAlert</h1>
            <p className="login-subtitle">
              Sign in to create alerts, sync them across devices, and stay on top of live crypto prices.
            </p>
            <button
              className="btn-google-signin"
              onClick={handleLogin}
              disabled={isAuthLoading}
              id="google-signin-btn"
            >
              {isAuthLoading ? 'Signing in...' : 'Continue with Google'}
            </button>
          </div>
        </div>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoading={isAuthLoading}
      />

      <div className="app-main">
        <div className="crypto-section">
          <CryptoList
            cryptos={cryptos}
            currentPrices={currentPrices}
            loading={loading}
            error={cryptoError}
            onSelectCrypto={handleSelectCrypto}
            onRefresh={() => {
              fetchCryptos(true);
            }}
          />
        </div>

        {user && (
          <div className="alerts-section">
            <PriceAlerts
              cryptoList={cryptos}
              userAlerts={userAlerts}
              selectedCrypto={selectedCrypto}
              onAddAlert={handleAddAlert}
              onDeleteAlert={handleDeleteAlert}
            />
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
