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
    const tmaUrl = process.env.TELEGRAM_TMA_URL;
    if (!botToken || !tmaUrl) {
        return NextResponse.json(
            { ok: false, error: "missing_bot_config" },
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

    const text =
        process.env.TELEGRAM_WELCOME_TEXT ||
        "Откройте мини-приложение по кнопке ниже.";
    const buttonText =
        process.env.TELEGRAM_WELCOME_BUTTON_TEXT || "Открыть приложение";

    const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: result.user.id,
                text,
                disable_web_page_preview: true,
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: buttonText,
                                web_app: { url: tmaUrl },
                            },
                        ],
                    ],
                },
            }),
        },
    );

    if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json(
            { ok: false, error: "telegram_failed", errorText },
            { status: 502 },
        );
    }

    return NextResponse.json({ ok: true });
}
