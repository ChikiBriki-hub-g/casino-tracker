import "dotenv/config";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PUBLIC_URL = process.env.NEXT_PUBLIC_APP_URL;

if (!BOT_TOKEN || !PUBLIC_URL) {
    console.error("Missing TELEGRAM_BOT_TOKEN or NEXT_PUBLIC_APP_URL");
    process.exit(1);
}

const webhookUrl = `${PUBLIC_URL.replace(/\/$/, "")}/api/tg/webhook`;

const run = async () => {
    const response = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: webhookUrl }),
        },
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
        console.error("Failed to set webhook:", data);
        process.exit(1);
    }

    console.log("Webhook set:", webhookUrl);
};

run();
