/**
 * Global Application Constants
 */

export const API_CONFIG = {
  COINGECKO_BASE_URL: 'https://api.coingecko.com/api/v3',
  COINGECKO_MARKETS_ENDPOINT: '/coins/markets',
  POLL_INTERVAL_MS: 60000,
  DEFAULT_CURRENCY: 'usd',
  PER_PAGE: 50,
};

export const ALERT_CONDITIONS = {
  ABOVE: 'above',
  BELOW: 'below',
};

export const ALERT_STATUS = {
  ACTIVE: 'active',
  TRIGGERED: 'triggered',
  DISMISSED: 'dismissed',
};

export const APP_THEME = {
  FONT_MAIN: "'Plus Jakarta Sans', sans-serif",
  FONT_MONO: "'Roboto Mono', monospace",
};
