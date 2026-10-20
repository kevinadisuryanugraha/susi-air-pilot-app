export const AVIATION_CONSTANTS = {
  DEFAULT_TODAY: '2026-05-15',
  JWT_SECRET: process.env.JWT_SECRET || 'susiair-pilot-ops-secret-key-2026',
  HARDCODED_PILOT: {
    username: 'johndoe',
    password: 'susiairtest',
    name: 'John Doe',
    avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80',
    totalFlightHours: 1444.5,
  },
  REGULATORY_LIMITS: {
    daily: 8,
    weekly: 40,
    monthly: 100,
    annual: 1050,
  },
  CHART_BOUNDS: {
    '1w': { limit: 40, max: 45, windowDays: 7, displayRangeDays: 7 },
    '1m': { limit: 100, max: 125, windowDays: 30, displayRangeDays: 7 },
    '3m': { limit: 300, max: 325, windowDays: 90, displayRangeDays: 7 },
    '6m': { limit: 600, max: 625, windowDays: 180, displayRangeDays: 7 },
    '1y': { limit: 1050, max: 1200, windowDays: 365, displayRangeDays: 7 },
  },
} as const;

export type ChartRange = keyof typeof AVIATION_CONSTANTS.CHART_BOUNDS;
