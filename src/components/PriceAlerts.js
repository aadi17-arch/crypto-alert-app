import React, { useEffect, useState } from 'react';
import { IoTrashOutline } from 'react-icons/io5';
import { RiAlarmWarningLine } from 'react-icons/ri';

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
    if (!selectedCrypto) {
      return;
    }

    setCoinId(selectedCrypto.coinId || '');
    setTargetPrice(
      selectedCrypto.targetPrice != null ? String(selectedCrypto.targetPrice) : ''
    );
    setCondition(selectedCrypto.condition || 'above');
  }, [selectedCrypto]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      coinId,
      targetPrice: parseFloat(targetPrice),
      condition
    };
    onAddAlert(data);
    setCoinId('');
    setTargetPrice('');
    setCondition('above');
  };

  return (
    <div className="pa">
      <div className="pa-card">
        <h3 className="pa-title">Create Alert</h3>
        <form onSubmit={handleSubmit}>
          <div className="pa-group">
            <label className="pa-label">Cryptocurrency</label>
            <select
              name="coinId"
              className="pa-select"
              value={coinId}
              onChange={(e) => setCoinId(e.target.value)}
              required
            >
              <option value="">Select a coin...</option>
              {cryptoList.map((coin) => (
                <option key={coin.id} value={coin.id}>
                  {coin.name} ({coin.symbol?.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div className="pa-group">
            <label className="pa-label">Target Price (USD)</label>
            <input
              type="number"
              name="targetPrice"
              step="any"
              min="0"
              placeholder="Target Price"
              className="pa-input"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              required
            />
          </div>

          <div className="pa-group">
            <label className="pa-label">Condition</label>
            <div className="pa-radio-group">
              <label className="pa-radio">
                <input
                  type="radio"
                  name="condition"
                  value="above"
                  checked={condition === 'above'}
                  onChange={(e) => setCondition(e.target.value)}
                />
                Goes ABOVE
              </label>
              <label className="pa-radio">
                <input
                  type="radio"
                  name="condition"
                  value="below"
                  checked={condition === 'below'}
                  onChange={(e) => setCondition(e.target.value)}
                />
                Goes BELOW
              </label>
            </div>
          </div>

          <button type="submit" className="pa-submit">
            Create Alert
          </button>
        </form>
      </div>

      <div className="pa-list">
        <h3 className="pa-list__header">Active Alerts ({userAlerts.length})</h3>

        {userAlerts.length === 0 ? (
          <div className="pa-empty">
            <RiAlarmWarningLine className="pa-empty__icon" />
            <p>No alerts yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="pa-list__items">
            {userAlerts.map((alert) => (
              <div key={alert.id} className="pa-alert">
                <div>
                  <div className="pa-alert__name">{alert.cryptoName || alert.coinName}</div>
                  <div className="pa-alert__condition">
                    {String(alert.condition).toLowerCase() === 'above' ? 'Above' : 'Below'} ${alert.targetPrice}
                  </div>
                </div>

                <div className="pa-alert__actions">
                  <span
                    className={`pa-badge ${
                      alert.status === 'triggered' || alert.triggered
                        ? 'pa-badge--triggered'
                        : 'pa-badge--active'
                    }`}
                  >
                    {alert.status === 'triggered' || alert.triggered ? 'Triggered' : 'Active'}
                  </span>

                  <button
                    type="button"
                    onClick={() => onDeleteAlert(alert.id)}
                    className="pa-delete"
                    aria-label={`Delete ${alert.cryptoName || alert.coinName} alert`}
                  >
                    <IoTrashOutline />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
