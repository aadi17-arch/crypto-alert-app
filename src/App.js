import React, { useState } from 'react';
import Header from './components/Header';
import CryptoList from './components/CryptoList';
import Toast from './components/Toast';
import { useAuth } from './contexts/AuthContext';
import { AlertProvider, useAlerts } from './contexts/AlertContext';
import { useCryptoPrices } from './hooks/useCryptoPrices';
import { ALERT_CONDITIONS } from './utils/constants';
import './App.css';

function MainApp() {
  const { user, signInWithGoogle, logout } = useAuth();
  const { cryptos, loading } = useCryptoPrices();
  const [showNotifications, setShowNotifications] = useState(false);
  const [npTab, setNpTab] = useState('notifications');
  const [showProfile, setShowProfile] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [alertTarget, setAlertTarget] = useState('');
  const [alertCondition, setAlertCondition] = useState(ALERT_CONDITIONS.ABOVE);
  const [toast, setToast] = useState(null);

  const { activeAlerts, historyAlerts, createAlert, dismissAlert } = useAlerts();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      setToast({ message: 'Authentication failed', type: 'error' });
    }
  };

  const handleSelectCrypto = (coin) => {
    setSelectedCrypto(coin);
    setAlertTarget(coin.current_price.toString());
  };

  const handleSetQuickAlert = async () => {
    if (!user) return setToast({ message: 'Sign in required', type: 'error' });
    if (!selectedCrypto || !alertTarget) return;

    try {
      await createAlert({
        cryptoId: selectedCrypto.id,
        cryptoName: selectedCrypto.name,
        targetPrice: Number(alertTarget),
        condition: alertCondition
      });
      setToast({ message: 'Alert established', type: 'success' });
    } catch (e) {
      setToast({ message: 'Failed to set alert', type: 'error' });
    }
  };

  const totalNotificationCount = activeAlerts.length + historyAlerts.length;

  return (
    <div className="app-shell">
      <div className="scanline"></div>
      <Header 
        user={user} 
        onLogin={handleLogin} 
        onLogout={logout} 
        onToggleNotifications={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
        onToggleProfile={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
        notificationCount={totalNotificationCount}
      />
      
      {showNotifications && (
        <>
          <div className="np-backdrop" onClick={() => setShowNotifications(false)}></div>
          <div className="notification-panel">
            <div className="np-header-tabs">
              <button 
                className={`np-tab-btn ${npTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setNpTab('notifications')}
              >
                History ({historyAlerts.length})
              </button>
              <button 
                className={`np-tab-btn ${npTab === 'monitors' ? 'active' : ''}`}
                onClick={() => setNpTab('monitors')}
              >
                Active ({activeAlerts.length})
              </button>
              <button className="np-close-btn-minimal" onClick={() => setShowNotifications(false)}>x</button>
            </div>
            <div className="np-body">
              {npTab === 'notifications' ? (
                historyAlerts.length > 0 ? (
                  historyAlerts.map(alert => (
                    <div key={alert.id} className="np-item">
                      <div className="np-item-info">
                        <strong>{alert.cryptoName}</strong>
                        <span>Triggered at ${alert.targetPrice}</span>
                      </div>
                      <button className="np-item-clear" onClick={() => dismissAlert(alert.id)}>Dismiss</button>
                    </div>
                  ))
                ) : (
                  <div className="np-empty">No trigger history found</div>
                )
              ) : (
                activeAlerts.length > 0 ? (
                  activeAlerts.map(alert => (
                    <div key={alert.id} className="np-item">
                      <div className="np-item-info">
                        <strong>{alert.cryptoName}</strong>
                        <span style={{ color: 'var(--accent-yellow)' }}>{alert.condition.toUpperCase()} ${alert.targetPrice}</span>
                      </div>
                      <button className="np-item-clear" onClick={() => dismissAlert(alert.id)}>Cancel</button>
                    </div>
                  ))
                ) : (
                  <div className="np-empty">No active monitors established</div>
                )
              )}
            </div>
          </div>
        </>
      )}

      {showProfile && user && (
        <>
          <div className="np-backdrop" onClick={() => setShowProfile(false)}></div>
          <div className="profile-panel">
            <div className="pp-header">
              <span className="pp-title">User Profile</span>
              <button className="np-close-btn" onClick={() => setShowProfile(false)}>&times;</button>
            </div>
            <div className="pp-body">
              <div className="pp-user-info">
                <img src={user.photoURL} alt="Avatar" className="pp-avatar" />
                <div className="pp-details">
                  <span className="pp-name">{user.displayName}</span>
                  <span className="pp-email">{user.email}</span>
                </div>
              </div>
              <div className="pp-stats">
                <div className="pp-stat-item">
                  <span className="pp-stat-label">Total Monitors</span>
                  <span className="pp-stat-value">{activeAlerts.length + historyAlerts.length}</span>
                </div>
                <div className="pp-stat-item">
                  <span className="pp-stat-label">Security Tier</span>
                  <span className="pp-stat-value" style={{ color: 'var(--accent-yellow)' }}>Console Alpha</span>
                </div>
              </div>

              <button className="btn-pp-logout" onClick={() => { logout(); setShowProfile(false); }}>
                Logout
              </button>
            </div>
          </div>
        </>
      )}
      
      <main className="app-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '100px' }}>
        <CryptoList 
          cryptos={cryptos} 
          loading={loading} 
          onSelectCrypto={handleSelectCrypto} 
        />
      </main>

      <div className="quick-alert-bar">
        {selectedCrypto ? (
          <div className="alert-config">
            <span>Set Alert &rarr;</span>
            <div className="config-item">
              Coin <span className="alert-val">{selectedCrypto.symbol.toUpperCase()}</span>
            </div>
            <div className="config-item">
              Target 
              <input 
                className="console-input"
                style={{ width: '100px' }}
                value={alertTarget}
                onChange={(e) => setAlertTarget(e.target.value)}
              />
            </div>
            <div className="config-item">
              Condition 
              <select 
                className="console-select"
                value={alertCondition}
                onChange={(e) => setAlertCondition(e.target.value)}
              >
                <option value={ALERT_CONDITIONS.ABOVE}>Above</option>
                <option value={ALERT_CONDITIONS.BELOW}>Below</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="alert-config" style={{ opacity: 0.5 }}>
            <span>Set Alert &rarr;</span>
            <div className="config-item">Select an asset from the list to set an alert</div>
          </div>
        )}
        <button 
          className="btn-set-alert" 
          onClick={handleSetQuickAlert}
          disabled={!selectedCrypto}
        >
          {selectedCrypto ? 'Set Alert' : 'Pending...'}
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function App() {
  const { currentPrices } = useCryptoPrices();
  
  return (
    <AlertProvider currentPrices={currentPrices}>
      <MainApp />
    </AlertProvider>
  );
}

export default App;
