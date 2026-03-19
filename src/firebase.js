import { initializeApp } from "firebase/app";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  query,
  Timestamp,
  updateDoc,
  where
} from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut
} from "firebase/auth";

const readEnv = (key) => process.env[key]?.trim() || "";

const firebaseConfig = {
  apiKey: readEnv("REACT_APP_FIREBASE_API_KEY"),
  authDomain: readEnv("REACT_APP_FIREBASE_AUTH_DOMAIN"),
  projectId: readEnv("REACT_APP_FIREBASE_PROJECT_ID"),
  storageBucket: readEnv("REACT_APP_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: readEnv("REACT_APP_FIREBASE_MESSAGING_SENDER_ID"),
  appId: readEnv("REACT_APP_FIREBASE_APP_ID")
};

const missingFirebaseConfig = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingFirebaseConfig.length > 0) {
  throw new Error(
    `Missing Firebase environment variables: ${missingFirebaseConfig.join(", ")}`
  );
}

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account"
  });

  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    const readableError =
      error.code === "auth/unauthorized-domain"
        ? "This domain is not authorized in Firebase Authentication."
        : error.code === "auth/popup-blocked"
          ? "Popup was blocked by the browser. Please allow popups and try again."
          : error.code === "auth/popup-closed-by-user"
            ? "Signin popup was closed before completing authentication."
            : error.code === "auth/operation-not-allowed"
              ? "Google sign-in is not enabled in Firebase Authentication."
              : error.message;

    const enhancedError = new Error(readableError || "Google login failed.");
    enhancedError.code = error.code;
    throw enhancedError;
  }
};

export const signOutUser = async () => {
  await firebaseSignOut(auth);
};

export const addAlertToFirestore = async (userId, alertData) => {
  const docRef = await addDoc(collection(db, "alerts"), {
    userId,
    ...alertData,
    status: "active",
    createdAt: Timestamp.now(),
    triggeredAt: null
  });

  return docRef.id;
};

export const deleteAlertFromFirestore = async (alertId) => {
  await deleteDoc(doc(db, "alerts", alertId));
};

export const updateAlertStatus = async (alertId, newStatus) => {
  await updateDoc(doc(db, "alerts", alertId), {
    status: newStatus,
    triggeredAt: newStatus === "triggered" ? Timestamp.now() : null
  });
};

export const subscribeToUserAlerts = (userId, callback) => {
  const q = query(collection(db, "alerts"), where("userId", "==", userId));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const alerts = snapshot.docs.map((alertDoc) => ({
      id: alertDoc.id,
      ...alertDoc.data()
    }));

    callback(alerts);
  });

  return unsubscribe;
};

export const listenToAuthState = (callback) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    callback(user);
  });

  return unsubscribe;
};

export default app;
