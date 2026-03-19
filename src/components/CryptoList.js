import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  IoSearch,
  IoRefresh,
  IoTrendingUp,
  IoTrendingDown,
  IoNotificationsOutline,
  IoChevronDown,
  IoAlertCircleOutline,
} from 'react-icons/io5';
import { RiCoinsFill } from 'react-icons/ri';

function Sparkline({ data, positive, width = 80, height = 32 }) {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  const color = positive ? '#22c55e' : '#ef4444';
  const gradientId = `spark-${positive ? 'up' : 'down'}-${Math.random().toString(36).slice(2, 8)}`;
  const fillPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="sparkline-svg">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill={`url(#${gradientId})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="cl-card cl-card--skeleton">
      <div className="cl-card__header">
        <div className="skeleton-circle" />
        <div className="skeleton-lines">
          <div className="skeleton-line skeleton-line--w60" />
          <div className="skeleton-line skeleton-line--w40" />
        </div>
      </div>
      <div className="cl-card__body">
        <div className="skeleton-line skeleton-line--w80 skeleton-line--lg" />
        <div className="skeleton-line skeleton-line--w50" />
      </div>
      <div className="cl-card__footer">
        <div className="skeleton-line skeleton-line--w100 skeleton-line--chart" />
      </div>
    </div>
  );
}

const SORT_OPTIONS = [
  { value: 'market_cap_desc', label: 'Market Cap Desc' },
  { value: 'market_cap_asc', label: 'Market Cap Asc' },
  { value: 'price_desc', label: 'Price Desc' },
  { value: 'price_asc', label: 'Price Asc' },
  { value: 'change_desc', label: '24h Change Desc' },
  { value: 'change_asc', label: '24h Change Asc' },
];

function CryptoList({
  onSelectCrypto,
  onDataLoaded,
  data: externalData,
  cryptos,
  loading: externalLoading,
  error: externalError,
  onRefresh
}) {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('market_cap_desc');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const controlledData = Array.isArray(externalData) ? externalData : cryptos;
  const isControlled = Array.isArray(controlledData);

  const fetchCryptoData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      setError(null);

      const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 50,
          page: 1,
          sparkline: true,
          price_change_percentage: '24h',
        },
      });

      setCryptoData(response.data);
      setLastUpdated(new Date());
      if (onDataLoaded) onDataLoaded(response.data);
    } catch (requestError) {
      console.error('Error fetching crypto data:', requestError);
      if (cryptoData.length === 0) {
        setError('Failed to load cryptocurrency data. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [cryptoData.length, onDataLoaded]);

  useEffect(() => {
    if (isControlled) {
      return undefined;
    }

    fetchCryptoData();
    const interval = setInterval(() => fetchCryptoData(false), 60000);
    return () => clearInterval(interval);
  }, [fetchCryptoData, isControlled]);

  useEffect(() => {
    if (!isControlled) {
      return;
    }

    setCryptoData(controlledData);
    setLoading(Boolean(externalLoading));
    setError(externalError || null);
    if (controlledData.length > 0) {
      setLastUpdated(new Date());
    }
  }, [controlledData, externalError, externalLoading, isControlled]);

  const filteredAndSorted = useMemo(() => {
    const result = [...cryptoData];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      return result
        .filter((coin) => coin.name.toLowerCase().includes(query) || coin.symbol.toLowerCase().includes(query))
        .sort((a, b) => sortCoins(a, b, sortBy));
    }

    return result.sort((a, b) => sortCoins(a, b, sortBy));
  }, [cryptoData, searchQuery, sortBy]);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      return;
    }

    fetchCryptoData(true);
  };

  const handleCardClick = (coin) => {
    if (!onSelectCrypto) {
      return;
    }

    onSelectCrypto({
      coinId: coin.id,
      coinName: coin.name,
      coinSymbol: coin.symbol,
      coinImage: coin.image,
      targetPrice: coin.current_price,
      condition: 'above',
    });
  };

  if (loading) {
    return (
      <div className="cl-container" id="crypto-list-container">
        <div className="cl-toolbar">
          <div className="cl-toolbar__title">
            <RiCoinsFill className="cl-toolbar__icon" />
            <span>Top Cryptocurrencies</span>
          </div>
        </div>
        <div className="cl-grid">
          {Array.from({ length: 12 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error && cryptoData.length === 0) {
    return (
      <div className="cl-container" id="crypto-list-container">
        <div className="cl-error">
          <IoAlertCircleOutline className="cl-error__icon" />
          <h3 className="cl-error__title">Unable to load data</h3>
          <p className="cl-error__text">{error}</p>
          <button className="cl-error__btn" onClick={handleRefresh} id="retry-btn">
            <IoRefresh />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cl-container" id="crypto-list-container">
      <div className="cl-toolbar">
        <div className="cl-toolbar__title">
          <RiCoinsFill className="cl-toolbar__icon" />
          <span>Top Cryptocurrencies</span>
          <span className="cl-toolbar__count">{filteredAndSorted.length}</span>
        </div>

        <div className="cl-toolbar__actions">
          <div className="cl-search" id="crypto-search">
            <IoSearch className="cl-search__icon" />
            <input
              className="cl-search__input"
              type="text"
              placeholder="Search coins..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              id="crypto-search-input"
            />
          </div>

          <div className="cl-sort" id="crypto-sort">
            <select
              className="cl-sort__select"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              id="crypto-sort-select"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <IoChevronDown className="cl-sort__chevron" />
          </div>

          <button
            className={`cl-refresh-btn ${refreshing ? 'cl-refresh-btn--spinning' : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
            title={lastUpdated ? `Last updated: ${formatTime(lastUpdated)}` : 'Refresh'}
            id="crypto-refresh-btn"
          >
            <IoRefresh />
          </button>

          {lastUpdated && <span className="cl-toolbar__timestamp">{formatTime(lastUpdated)}</span>}
        </div>
      </div>

      {filteredAndSorted.length === 0 ? (
        <div className="cl-empty">
          <IoSearch className="cl-empty__icon" />
          <p className="cl-empty__text">
            No cryptocurrencies match "<strong>{searchQuery}</strong>"
          </p>
          <button className="cl-empty__btn" onClick={() => setSearchQuery('')}>
            Clear search
          </button>
        </div>
      ) : (
        <div className="cl-grid" id="crypto-grid">
          {filteredAndSorted.map((coin, index) => {
            const change = coin.price_change_percentage_24h || 0;
            const isPositive = change >= 0;
            const sparklineData = coin.sparkline_in_7d?.price;

            return (
              <div
                className="cl-card"
                key={coin.id}
                id={`crypto-card-${coin.id}`}
                onClick={() => handleCardClick(coin)}
              >
                <span className="cl-card__rank">#{coin.market_cap_rank || index + 1}</span>

                <button
                  className="cl-card__alert-btn"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleCardClick(coin);
                  }}
                  title={`Set alert for ${coin.name}`}
                >
                  <IoNotificationsOutline />
                </button>

                <div className="cl-card__header">
                  <img
                    className="cl-card__icon"
                    src={coin.image}
                    alt={coin.name}
                    loading="lazy"
                  />
                  <div className="cl-card__name-block">
                    <span className="cl-card__name">{coin.name}</span>
                    <span className="cl-card__symbol">{coin.symbol.toUpperCase()}</span>
                  </div>
                </div>

                <div className="cl-card__body">
                  <span className="cl-card__price">{formatPrice(coin.current_price)}</span>
                  <span className={`cl-card__change ${isPositive ? 'cl-card__change--up' : 'cl-card__change--down'}`}>
                    {isPositive ? <IoTrendingUp /> : <IoTrendingDown />}
                    {Math.abs(change).toFixed(2)}%
                  </span>
                </div>

                <div className="cl-card__meta">
                  <span className="cl-card__meta-label">Market Cap</span>
                  <span className="cl-card__meta-value">{formatMarketCap(coin.market_cap)}</span>
                </div>

                {sparklineData && sparklineData.length > 0 && (
                  <div className="cl-card__sparkline">
                    <Sparkline data={sparklineData} positive={isPositive} width={160} height={40} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function sortCoins(a, b, sortBy) {
  switch (sortBy) {
    case 'market_cap_desc':
      return (b.market_cap || 0) - (a.market_cap || 0);
    case 'market_cap_asc':
      return (a.market_cap || 0) - (b.market_cap || 0);
    case 'price_desc':
      return (b.current_price || 0) - (a.current_price || 0);
    case 'price_asc':
      return (a.current_price || 0) - (b.current_price || 0);
    case 'change_desc':
      return (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0);
    case 'change_asc':
      return (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0);
    default:
      return 0;
  }
}

function formatPrice(price) {
  if (!price && price !== 0) return '$-';
  if (price >= 1) {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (price >= 0.01) {
    return `$${price.toFixed(4)}`;
  }
  return `$${price.toFixed(8)}`;
}

function formatMarketCap(cap) {
  if (!cap) return '$-';
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)}M`;
  return `$${cap.toLocaleString()}`;
}

function formatTime(date) {
  if (!date) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default CryptoList;
