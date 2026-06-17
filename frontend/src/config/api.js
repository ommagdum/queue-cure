const _raw = (process.env.REACT_APP_API_URL || 'http://localhost:8080').replace(/\/$/, '');
export const API_BASE_URL = (typeof window !== 'undefined' && window.location.protocol === 'https:')
  ? _raw.replace(/^http:/, 'https:')
  : _raw;
