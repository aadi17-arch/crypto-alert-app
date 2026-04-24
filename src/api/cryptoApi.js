import axios from 'axios';
import { API_CONFIG } from '../utils/constants';

const cryptoClient = axios.create({
  baseURL: API_CONFIG.COINGECKO_BASE_URL,
  timeout: 10000,
});

/**
 * Fetches market data for the top cryptocurrencies
 */
export const getMarketData = async (params = {}) => {
  try {
    const response = await cryptoClient.get(API_CONFIG.COINGECKO_MARKETS_ENDPOINT, {
      params: {
        vs_currency: API_CONFIG.DEFAULT_CURRENCY,
        order: 'market_cap_desc',
        per_page: API_CONFIG.PER_PAGE,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h',
        ...params,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Crypto API Error:', error);
    throw error;
  }
};
