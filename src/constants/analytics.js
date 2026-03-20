const SESSION_TAGS = ["buy bonus", "base game", "test", "stream", "high bet"];
const MAX_RECENT_SLOTS = 8;
const MAX_RECENT_SESSIONS = 6;
const PERIOD_FILTERS = [
  { id: "today", label: "Сегодня", days: 0 },
  { id: "7d", label: "7 дней", days: 7 },
  { id: "30d", label: "30 дней", days: 30 },
  { id: "all", label: "Все время", days: null },
];

const CURRENCY_OPTIONS = [
  { value: "₽", label: "RUB (₽)" },
  { value: "$", label: "USD ($)" },
  { value: "€", label: "EUR (€)" },
  { value: "₴", label: "UAH (₴)" },
  { value: "₸", label: "KZT (₸)" },
  { value: "Br", label: "BYN (Br)" },
];

export {
  SESSION_TAGS,
  MAX_RECENT_SLOTS,
  MAX_RECENT_SESSIONS,
  PERIOD_FILTERS,
  CURRENCY_OPTIONS,
};
