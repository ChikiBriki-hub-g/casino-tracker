import { NextResponse } from "next/server";
import { verifyInitData } from "../../_utils/telegram";

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24;

export async function POST(request) {
    const body = await request.json().catch(() => ({}));
    const { initData } = body || {};
    if (!initData) {
        return NextResponse.json(
            { ok: false, error: "missing_init_data" },
            { status: 400 },
        );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
        return NextResponse.json(
            { ok: false, error: "missing_bot_token" },
            { status: 500 },
        );
    }

    const maxAgeSeconds = Number(
        process.env.TMA_AUTH_MAX_AGE_SEC || DEFAULT_MAX_AGE_SECONDS,
    );
    const result = verifyInitData(initData, botToken, maxAgeSeconds);
    if (!result.ok) {
        return NextResponse.json(
            { ok: false, error: result.reason },
            { status: 401 },
        );
    }

    return NextResponse.json({
        ok: true,
        user: result.user,
        authDate: result.authDate,
    });
}
