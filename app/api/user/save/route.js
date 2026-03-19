import { NextResponse } from "next/server";
import { doc, setDoc } from "firebase/firestore";
import { getDb } from "../../_utils/firebase-client";
import { verifyInitData } from "../../_utils/telegram";

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24;
const MAX_TRANSACTIONS = 2000;
const MAX_SLOT_GROUPS = 200;
const MAX_SLOT_ITEMS = 2000;
const MAX_CUSTOM_SLOTS = 1000;
const MAX_SLOT_NAME_LENGTH = 120;

const getUserId = (initData) => {
  if (!initData) {
    if (process.env.NODE_ENV !== "production") {
      return "local_test_user";
    }
    return null;
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return { error: "missing_bot_token" };
  }

  const maxAgeSeconds = Number(
    process.env.TMA_AUTH_MAX_AGE_SEC || DEFAULT_MAX_AGE_SECONDS,
  );
  const result = verifyInitData(initData, botToken, maxAgeSeconds);
  if (!result.ok) return { error: result.reason };

  return result.user.id.toString();
};

const normalizeSlotName = (value) => value.trim().replace(/\s+/g, " ");

const isValidSlotName = (value) => {
  if (typeof value !== "string") return false;
  const normalized = normalizeSlotName(value);
  return normalized.length > 0 && normalized.length <= MAX_SLOT_NAME_LENGTH;
};

const sanitizeCustomSlots = (slots) => {
  const uniqueSlots = [];
  const seen = new Set();

  for (const slot of slots) {
    const normalized = normalizeSlotName(slot);
    const key = normalized.toLowerCase();
    if (!normalized || seen.has(key)) continue;

    seen.add(key);
    uniqueSlots.push(normalized);
  }

  return uniqueSlots.slice(0, MAX_CUSTOM_SLOTS);
};

const isValidPayload = (payload) => {
  if (!payload || typeof payload !== "object") return false;
  if (!Array.isArray(payload.transactions)) return false;
  if (!Array.isArray(payload.slotGroups)) return false;
  if (
    payload.customSlots !== undefined &&
    !Array.isArray(payload.customSlots)
  ) {
    return false;
  }
  if (
    payload.favoriteSlots !== undefined &&
    !Array.isArray(payload.favoriteSlots)
  ) {
    return false;
  }
  if (typeof payload.currency !== "string") return false;
  if (payload.transactions.length > MAX_TRANSACTIONS) return false;
  if (payload.slotGroups.length > MAX_SLOT_GROUPS) return false;
  if ((payload.customSlots || []).length > MAX_CUSTOM_SLOTS) return false;
  if ((payload.favoriteSlots || []).length > MAX_CUSTOM_SLOTS) return false;

  for (const group of payload.slotGroups) {
    if (!group || typeof group !== "object") return false;
    if (!Array.isArray(group.items)) return false;
    if (group.items.length > MAX_SLOT_ITEMS) return false;
  }

  for (const slot of payload.customSlots || []) {
    if (!isValidSlotName(slot)) return false;
  }

  for (const slot of payload.favoriteSlots || []) {
    if (!isValidSlotName(slot)) return false;
  }

  return true;
};

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { initData, data } = body || {};

  const userId = getUserId(initData);
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "missing_init_data" },
      { status: 400 },
    );
  }
  if (userId?.error) {
    const status = userId.error === "missing_bot_token" ? 500 : 401;
    return NextResponse.json({ ok: false, error: userId.error }, { status });
  }

  if (!isValidPayload(data)) {
    return NextResponse.json(
      { ok: false, error: "invalid_payload" },
      { status: 400 },
    );
  }

  const db = getDb();
  await setDoc(
    doc(db, "users", userId),
    {
      transactions: data.transactions,
      slotGroups: data.slotGroups,
      customSlots: sanitizeCustomSlots(data.customSlots || []),
      favoriteSlots: sanitizeCustomSlots(data.favoriteSlots || []),
      currency: data.currency,
    },
    { merge: true },
  );

  return NextResponse.json({ ok: true });
}
