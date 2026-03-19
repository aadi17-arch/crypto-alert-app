import React from "react";
import { BsCurrencyBitcoin } from "react-icons/bs";

function Header({ user, onLogin, onLogout, isLoading }) {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <div className="app-header__icon">
          <BsCurrencyBitcoin size={24} />
        </div>
        <div className="app-header__copy">
          <h1>CryptoAlert</h1>
          <p>Track markets and manage price alerts</p>
        </div>
      </div>

      <div className="app-header__actions">
        {!user && !isLoading && (
          <button type="button" onClick={onLogin} className="app-header__login">
            Sign in with Google
          </button>
        )}

        {isLoading && (
          <button type="button" disabled className="app-header__login">
            Signing in...
          </button>
        )}

        {user && !isLoading && (
          <>
            <span className="app-header__user">{user.displayName}</span>
            <button type="button" onClick={onLogout} className="app-header__logout">
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
