import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToUserAlerts, updateAlertStatus, addAlertToFirestore } from '../firebase';
import { ALERT_STATUS, ALERT_CONDITIONS } from '../utils/constants';

const AlertContext = createContext(null);

export function useAlerts() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
}

export function AlertProvider({ children, currentPrices }) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);

  // Subscribe to user alerts from Firestore
  useEffect(() => {
    if (!user) {
      setAlerts([]);
      return;
    }
    return subscribeToUserAlerts(user.uid, (data) => {
      setAlerts(data);
    });
  }, [user]);

  // Monitor prices and trigger alerts
  useEffect(() => {
    if (!user || alerts.length === 0 || !currentPrices) return;

    alerts.forEach((alert) => {
      const currentPrice = currentPrices[alert.cryptoId];
      if (currentPrice == null || alert.status !== ALERT_STATUS.ACTIVE) return;

      const target = Number(alert.targetPrice);
      const isTriggered = 
        (alert.condition === ALERT_CONDITIONS.ABOVE && currentPrice > target) ||
        (alert.condition === ALERT_CONDITIONS.BELOW && currentPrice < target);

      if (isTriggered) {
        updateAlertStatus(alert.id, ALERT_STATUS.TRIGGERED);
      }
    });
  }, [currentPrices, alerts, user]);

  const createAlert = async (alertData) => {
    if (!user) throw new Error('Authentication required');
    return await addAlertToFirestore(user.uid, alertData);
  };

  const dismissAlert = (alertId) => {
    updateAlertStatus(alertId, ALERT_STATUS.DISMISSED);
  };

  const activeAlerts = alerts.filter(a => a.status === ALERT_STATUS.ACTIVE);
  const historyAlerts = alerts.filter(a => a.status === ALERT_STATUS.TRIGGERED);

  const value = {
    alerts,
    activeAlerts,
    historyAlerts,
    createAlert,
    dismissAlert,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
}
