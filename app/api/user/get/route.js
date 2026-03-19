import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { getDb } from "../../_utils/firebase-client";
import { verifyInitData } from "../../_utils/telegram";

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24;

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

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { initData } = body || {};

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

  const db = getDb();
  const docSnap = await getDoc(doc(db, "users", userId));
  const data = docSnap.exists() ? docSnap.data() : {};

  return NextResponse.json({
    ok: true,
    data: {
      transactions: data?.transactions || [],
      slotGroups: data?.slotGroups || [],
      customSlots: data?.customSlots || [],
      currency: data?.currency || "₽",
    },
  });
}
