import React, { useEffect, useState } from 'react';
import { IoTrashOutline } from 'react-icons/io5';
import { BsBellFill } from 'react-icons/bs';

export default function PriceAlerts({
  cryptoList = [],
  userAlerts = [],
  selectedCrypto = null,
  onAddAlert,
  onDeleteAlert
}) {
  const [coinId, setCoinId] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState('above');

  useEffect(() => {
    if (selectedCrypto) {
      setCoinId(selectedCrypto.id || selectedCrypto.coinId || '');
      setTargetPrice(selectedCrypto.current_price || selectedCrypto.targetPrice || '');
    }
  }, [selectedCrypto]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddAlert({ coinId, targetPrice, condition });
    setCoinId('');
    setTargetPrice('');
  };

  return (
    <div className="pa">
      <div className="pa-card" style={{ background: '#1e1e1e', borderRadius: '24px', padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 className="pa-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BsBellFill style={{ color: '#fbbf24' }} />
          Create Price Alert
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="pa-group">
            <label className="pa-label">Asset</label>
            <select className="pa-select" value={coinId} onChange={e => setCoinId(e.target.value)} required>
              <option value="">Select a coin...</option>
              {cryptoList.slice(0, 20).map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.symbol.toUpperCase()})</option>
              ))}
            </select>
          </div>
          <div className="pa-group">
            <label className="pa-label">Target Price (USD)</label>
            <input 
              type="number" 
              step="any" 
              className="pa-input" 
              value={targetPrice} 
              onChange={e => setTargetPrice(e.target.value)} 
              required 
            />
          </div>
          <div className="pa-group">
            <label className="pa-label">Condition</label>
            <div className="pa-radio-group">
              <label className="pa-radio"><input type="radio" checked={condition === 'above'} onChange={() => setCondition('above')} /> Goes Above</label>
              <label className="pa-radio"><input type="radio" checked={condition === 'below'} onChange={() => setCondition('below')} /> Goes Below</label>
            </div>
          </div>
          <button type="submit" className="btn-alert" style={{ width: '100%', padding: '1rem', marginTop: '0.5rem' }}>Set Alert</button>
        </form>
      </div>

      <div className="pa-list">
        <h3 className="pa-list__header" style={{ opacity: 0.6, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Active Alerts ({userAlerts.length})
        </h3>
        <div className="pa-list__items" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {userAlerts.map(alert => (
            <div key={alert.id} className="alert-banner" style={{ padding: '1rem' }}>
              <div className="ab-content" style={{ gap: '0.75rem' }}>
                <div className="ab-icon" style={{ width: '32px', height: '32px' }}>
                  <BsBellFill size={16} />
                </div>
                <div className="ab-text">
                  <h4 style={{ fontSize: '0.9rem' }}>{alert.cryptoName}</h4>
                  <p style={{ fontSize: '0.75rem' }}>{alert.condition.toUpperCase()} ${alert.targetPrice}</p>
                </div>
              </div>
              <button 
                className="pa-delete" 
                onClick={() => onDeleteAlert(alert.id)}
                style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer' }}
              >
                <IoTrashOutline size={20} />
              </button>
            </div>
          ))}
          {userAlerts.length === 0 && <p style={{ color: '#666', textAlign: 'center', marginTop: '1rem' }}>No alerts configured.</p>}
        </div>
      </div>
    </div>
  );
}
