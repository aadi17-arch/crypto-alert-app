import React from 'react';
import { 
  formatCurrency, 
  formatPercentage, 
  formatCompactNumber 
} from '../utils/formatters';

const CryptoList = ({ cryptos, loading, onSelectCrypto }) => {
  if (loading && cryptos.length === 0) {
    return (
      <div className="console-loading">
        <div className="loading-bar"></div>
        <span>ESTABLISHING SECURE CONNECTION...</span>
      </div>
    );
  }

  return (
    <div className="console-list">
      <div className="console-table-header">
        <div className="c-rank">#</div>
        <div className="c-name">ASSET</div>
        <div className="c-price">PRICE (USD)</div>
        <div className="c-change">24H %</div>
        <div className="c-mktcap">MKT CAP</div>
      </div>
      
      <div className="console-rows">
        {cryptos.map((coin) => (
          <div 
            key={coin.id} 
            className="console-row"
            onClick={() => onSelectCrypto(coin)}
          >
            <div className="c-rank">{coin.market_cap_rank}</div>
            <div className="c-name">
              <img src={coin.image} alt={coin.name} className="coin-icon" />
              <div className="coin-info">
                <span className="coin-symbol">{coin.symbol.toUpperCase()}</span>
                <span className="coin-full-name">{coin.name}</span>
              </div>
            </div>
            <div className="c-price">{formatCurrency(coin.current_price)}</div>
            <div className={`c-change ${coin.price_change_percentage_24h >= 0 ? 'txt-up' : 'txt-up'} ${coin.price_change_percentage_24h < 0 ? 'txt-down' : ''}`}>
              {formatPercentage(coin.price_change_percentage_24h)}
            </div>
            <div className="c-mktcap">{formatCompactNumber(coin.market_cap)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CryptoList;
