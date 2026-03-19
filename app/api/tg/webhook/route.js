import { NextResponse } from "next/server";

const TELEGRAM_API = "https://api.telegram.org";

const sendWelcome = async (botToken, tmaUrl, chatId) => {
    const text =
        process.env.TELEGRAM_WELCOME_TEXT ||
        "Откройте мини-приложение по кнопке ниже.";
    const buttonText =
        process.env.TELEGRAM_WELCOME_BUTTON_TEXT || "Открыть приложение";

    const response = await fetch(`${TELEGRAM_API}/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
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
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Telegram sendMessage failed:", errorText);
    }
};

export async function POST(request) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const tmaUrl = process.env.TELEGRAM_TMA_URL;
    if (!botToken || !tmaUrl) {
        return NextResponse.json(
            { ok: false, error: "missing_bot_config" },
            { status: 500 },
        );
    }

    const update = await request.json().catch(() => null);
    if (!update) return NextResponse.json({ ok: true });

    const message = update.message || update.edited_message;
    if (!message?.text) return NextResponse.json({ ok: true });

    if (message.text.trim().startsWith("/start")) {
        await sendWelcome(botToken, tmaUrl, message.chat.id);
    }

    return NextResponse.json({ ok: true });
}
