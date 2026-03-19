import crypto from "node:crypto";

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24;

const parseInitData = (initData) => {
    const params = new URLSearchParams(initData);
    const data = {};
    for (const [key, value] of params.entries()) {
        data[key] = value;
    }
    return data;
};

export const verifyInitData = (
    initData,
    botToken,
    maxAgeSeconds = DEFAULT_MAX_AGE_SECONDS,
) => {
    const data = parseInitData(initData);
    const hash = data.hash;
    if (!hash) return { ok: false, reason: "missing_hash" };
    delete data.hash;

    const dataCheckString = Object.keys(data)
        .sort()
        .map((key) => `${key}=${data[key]}`)
        .join("\n");

    const secretKey = crypto
        .createHmac("sha256", "WebAppData")
        .update(botToken)
        .digest();
    const calculatedHash = crypto
        .createHmac("sha256", secretKey)
        .update(dataCheckString)
        .digest("hex");

    if (calculatedHash !== hash) return { ok: false, reason: "bad_hash" };

    const authDate = Number(data.auth_date || 0);
    const now = Math.floor(Date.now() / 1000);
    if (!authDate || now - authDate > maxAgeSeconds) {
        return { ok: false, reason: "expired" };
    }

    let user = null;
    if (data.user) {
        try {
            user = JSON.parse(data.user);
        } catch {
            return { ok: false, reason: "bad_user" };
        }
    }

    if (!user?.id) return { ok: false, reason: "missing_user" };
    return { ok: true, user, authDate };
};
