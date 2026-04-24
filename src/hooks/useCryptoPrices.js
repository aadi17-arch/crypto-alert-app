import { useState, useEffect, useCallback } from 'react';
import { getMarketData } from '../api/cryptoApi';
import { API_CONFIG } from '../utils/constants';

/**
 * Hook for managing real-time cryptocurrency prices
 */
export const useCryptoPrices = () => {
  const [cryptos, setCryptos] = useState([]);
  const [currentPrices, setCurrentPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrices = useCallback(async () => {
    try {
      const data = await getMarketData();
      
      // Update the main list
      setCryptos(data);
      
      // Generate a map for O(1) price lookups
      const priceMap = data.reduce((acc, coin) => {
        acc[coin.id] = coin.current_price;
        return acc;
      }, {});
      
      setCurrentPrices(priceMap);
      setError(null);
    } catch (err) {
      setError('Market connection disrupted');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, API_CONFIG.POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return { cryptos, currentPrices, loading, error, refresh: fetchPrices };
};
