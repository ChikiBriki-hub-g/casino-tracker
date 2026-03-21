const formatInputWithCommas = (str) => {
  if (!str) return "";
  const clean = str.replace(/[\s,]/g, "");
  const match = clean.match(/^(\d+)(.*)$/);
  if (!match) return str;

  const numPart = parseInt(match[1], 10);
  const restPart = match[2];
  const formattedNum = numPart.toLocaleString("en-US");
  return formattedNum + restPart;
};

const parseAmount = (str) => {
  if (!str) return NaN;

  let cleanStr = str
    .toString()
    .toLowerCase()
    .replace(/[\s,]/g, "")
    .replace(",", ".");
  let multiplier = 1;

  if (cleanStr.includes("k") || cleanStr.includes("к")) {
    multiplier = 1000;
    cleanStr = cleanStr.replace(/[kк]/g, "");
  } else if (cleanStr.includes("m") || cleanStr.includes("м")) {
    multiplier = 1000000;
    cleanStr = cleanStr.replace(/[mм]/g, "");
  }

  const val = parseFloat(cleanStr);
  return isNaN(val) ? NaN : val * multiplier;
};

const calculateX = (winStr, betStr) => {
  const win = parseAmount(winStr);
  const bet = parseAmount(betStr);
  if (isNaN(win) || isNaN(bet) || bet <= 0) return null;

  const x = win / bet;
  return Number.isInteger(x) ? x.toString() : x.toFixed(2).replace(/\.00$/, "");
};

const normalizeSlotName = (value) => value.trim().replace(/\s+/g, " ");

const mergeUniqueSlots = (slots) => {
  const uniqueSlots = [];
  const seen = new Set();

  slots.forEach((slot) => {
    const normalized = normalizeSlotName(slot);
    const key = normalized.toLowerCase();
    if (!normalized || seen.has(key)) return;
    seen.add(key);
    uniqueSlots.push(normalized);
  });

  return uniqueSlots.sort((a, b) => a.localeCompare(b));
};

const includesSlotQuery = (slot, query) => {
  if (!query) return true;
  return slot.toLowerCase().includes(query.toLowerCase());
};

const parseValidDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDisplayNumber = (value) =>
  Math.round(Number(value) || 0).toLocaleString("en-US");

const formatDisplayMoney = (value, currency) =>
  `${formatDisplayNumber(value)} ${currency}`;

const formatShortDateTime = (value) => {
  const date = parseValidDate(value);
  if (!date) return "";

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export {
  formatInputWithCommas,
  parseAmount,
  calculateX,
  normalizeSlotName,
  mergeUniqueSlots,
  includesSlotQuery,
  parseValidDate,
  formatDisplayNumber,
  formatDisplayMoney,
  formatShortDateTime,
};
