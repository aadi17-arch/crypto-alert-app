import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';

const ALERTS_COLLECTION = 'alerts';

/**
 * Add a new price alert for a user.
 * @param {string} userId - Firebase Auth UID
 * @param {string} cryptoId - CoinGecko coin ID (e.g., 'bitcoin')
 * @param {number} targetPrice - Target price in USD
 * @param {number} currentPrice - Current price at time of creation
 * @param {string} condition - 'above' or 'below'
 * @param {string} coinName - Display name (e.g., 'Bitcoin')
 * @param {string} coinSymbol - Symbol (e.g., 'btc')
 * @param {string} coinImage - Coin icon URL
 * @returns {Object} Created alert with Firestore doc ID
 */
export async function addAlert(userId, cryptoId, targetPrice, currentPrice, condition = 'above', coinName = '', coinSymbol = '', coinImage = '') {
  try {
    const alertData = {
      userId,
      cryptoId,
      coinName,
      coinSymbol,
      coinImage,
      targetPrice: Number(targetPrice),
      currentPriceAtCreation: Number(currentPrice),
      condition,
      status: 'active',       // active | triggered | dismissed
      triggered: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, ALERTS_COLLECTION), alertData);

    return {
      id: docRef.id,
      ...alertData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error adding alert:', error);
    throw new Error('Failed to create alert. Please try again.');
  }
}

/**
 * Get all alerts for a specific user.
 * @param {string} userId - Firebase Auth UID
 * @returns {Array} Array of alert objects
 */
export async function getUserAlerts(userId) {
  try {
    const q = query(
      collection(db, ALERTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    }));
  } catch (error) {
    console.error('Error getting alerts:', error);
    throw new Error('Failed to load alerts. Please try again.');
  }
}

/**
 * Subscribe to real-time updates for a user's alerts.
 * @param {string} userId - Firebase Auth UID
 * @param {function} callback - Called with updated alerts array
 * @param {function} onError - Called on error
 * @returns {function} Unsubscribe function
 */
export function subscribeToAlerts(userId, callback, onError) {
  const q = query(
    collection(db, ALERTS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const alerts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    }));
    callback(alerts);
  }, (error) => {
    console.error('Alert subscription error:', error);
    if (onError) onError(error);
  });
}

/**
 * Delete a specific alert.
 * @param {string} alertId - Firestore document ID
 */
export async function deleteAlert(alertId) {
  try {
    await deleteDoc(doc(db, ALERTS_COLLECTION, alertId));
  } catch (error) {
    console.error('Error deleting alert:', error);
    throw new Error('Failed to delete alert. Please try again.');
  }
}

/**
 * Update the status of an alert.
 * @param {string} alertId - Firestore document ID
 * @param {string} status - New status: 'active', 'triggered', or 'dismissed'
 */
export async function updateAlertStatus(alertId, status) {
  try {
    const alertRef = doc(db, ALERTS_COLLECTION, alertId);
    const updateData = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (status === 'triggered') {
      updateData.triggered = true;
      updateData.triggeredAt = serverTimestamp();
    }

    await updateDoc(alertRef, updateData);
  } catch (error) {
    console.error('Error updating alert:', error);
    throw new Error('Failed to update alert. Please try again.');
  }
}
