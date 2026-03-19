import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { SiBitcoin } from 'react-icons/si';
import { IoShieldCheckmark } from 'react-icons/io5';

function Login() {
  const { signInWithGoogle, error, clearError } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setSigningIn(true);
      clearError();
      await signInWithGoogle();
    } catch (err) {
      // Error is already handled in AuthContext
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <SiBitcoin />
        </div>
        <h1 className="login-title">CryptoAlert</h1>
        <p className="login-subtitle">
          Track cryptocurrency prices in real-time and set custom price alerts.
        </p>

        {error && (
          <div className="login-error" id="login-error">
            {error}
          </div>
        )}

        <button
          className="btn-google-signin"
          onClick={handleGoogleSignIn}
          disabled={signingIn}
          id="google-signin-btn"
        >
          {signingIn ? (
            <div className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
          ) : (
            <FcGoogle className="google-icon" />
          )}
          {signingIn ? 'Signing in...' : 'Continue with Google'}
        </button>

        <div className="login-features">
          <div className="login-feature">
            <IoShieldCheckmark className="login-feature-icon" />
            <span>Secure authentication via Firebase</span>
          </div>
          <div className="login-feature">
            <IoShieldCheckmark className="login-feature-icon" />
            <span>Alerts synced across all your devices</span>
          </div>
          <div className="login-feature">
            <IoShieldCheckmark className="login-feature-icon" />
            <span>Real-time price data from CoinGecko</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
