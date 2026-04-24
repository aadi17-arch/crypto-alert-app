import React from 'react';
import { BsBellFill } from 'react-icons/bs';

const Header = ({ user, onLogin, onLogout, isLoading, onToggleNotifications, onToggleProfile, notificationCount }) => {
  return (
    <header className="console-header">
      <div className="header-left">
        <div className="console-brand">
          CRYPTOALERT
        </div>
        <div className="status-live">
          <div className="status-dot"></div>
          <span className="flicker-text">LIVE</span>
        </div>
      </div>
      <div className="header-actions" style={{ marginLeft: 'auto', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {user && (
          <div className="notification-bell" onClick={onToggleNotifications} style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <BsBellFill size={20} color={notificationCount > 0 ? '#faff00' : '#444'} />
            {notificationCount > 0 && (
              <span className="bell-count">{notificationCount}</span>
            )}
          </div>
        )}
        {user ? (
          <div className="user-profile-trigger" onClick={onToggleProfile} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <img src={user.photoURL} alt="Avatar" className="header-avatar" />
          </div>
        ) : (
          <button 
            onClick={onLogin} 
            disabled={isLoading}
            className="btn-console-primary"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
