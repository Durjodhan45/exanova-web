const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Normalize URL: strip trailing slash and append /api/v1 if a root origin was provided
const normalizeApiUrl = (url: string) => {
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) return '/api/v1';
  if (trimmed.startsWith('http') && !trimmed.includes('/api')) {
    return `${trimmed}/api/v1`;
  }
  return trimmed;
};

export const ENV = {
  API_BASE_URL: normalizeApiUrl(rawBaseUrl),
  IS_PRODUCTION: import.meta.env.PROD,
};

export const BRANDING = {
  appName: 'ExaNova',
  fullName: 'Smart College Examination & Assessment System',
  tagline: 'Smart Examination for a Smarter Future.',
  organization: 'Techno Main Salt Lake',
  address: 'EM-4/1, EM Block, Sector V, Bidhannagar, Kolkata, West Bengal 700091, India.',
  email: 'info@ticollege.ac.in',
  developer: 'Durjodhan Mondal',
  github: 'https://github.com/Durjodhan45',
  colors: {
    primary: '#101B3F',     // Deep Navy Blue
    secondary: '#1E3E62',   // Royal Blue
    accent: '#00A896',      // Teal
    accentPurple: '#6246EA',// Royal Purple
    background: '#F8FAFC',  // Light Grey Background
    surface: '#FFFFFF',     // White
    textPrimary: '#0F172A', // Dark Navy
    textSecondary: '#475569',// Charcoal Slate
    border: '#E2E8F0',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
} as const;
