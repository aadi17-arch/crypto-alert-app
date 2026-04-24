/**
 * Financial Data Formatters
 */

/**
 * Formats a number as a currency string (USD)
 * Handles variable precision based on value size
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '---';
  
  const absValue = Math.abs(value);
  let precision = 2;
  
  if (absValue < 1) precision = 6;
  if (absValue < 0.0001) precision = 8;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);
};

/**
 * Formats a number as a percentage string
 */
export const formatPercentage = (value) => {
  if (value === null || value === undefined) return '0.00%';
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
};

/**
 * Formats large numbers into compact strings (e.g. 1.2B, 300M)
 */
export const formatCompactNumber = (value) => {
  if (value === null || value === undefined) return '---';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Formats date to a terminal-style timestamp
 */
export const formatTimestamp = (date) => {
  if (!date) return '---';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};
