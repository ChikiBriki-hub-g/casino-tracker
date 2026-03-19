# Casino Tracker (Telegram Mini App)

## Быстрый старт

1. `npm install`
2. Скопируйте `.env.example` в `.env` и заполните переменные.
3. `npm run dev`

## Переменные окружения

Клиент (Next.js, обязательно `NEXT_PUBLIC_`):
- `NEXT_PUBLIC_API_BASE_URL` (опционально, если API не на том же домене)
- `NEXT_PUBLIC_APP_URL` (публичный URL сайта для установки Telegram webhook)

Сервер (Next.js API routes):
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `TELEGRAM_BOT_TOKEN` (токен бота)
- `TELEGRAM_TMA_URL` (URL мини-приложения)
- `TELEGRAM_WELCOME_TEXT` (текст сообщения, опционально)
- `TELEGRAM_WELCOME_BUTTON_TEXT` (текст кнопки, опционально)
- `TMA_AUTH_MAX_AGE_SEC` (макс. возраст `initData`, по умолчанию 86400)

## Telegram Mini App

Эндпоинты:
- `POST /api/tma/verify` — проверка `initData` и получение `user.id`.
- `POST /api/tma/send-welcome` — отправка пользователю сообщения с кнопкой открытия мини-приложения.

Внутри приложения пользователь определяется только после серверной проверки `initData`. В проде доступ возможен только из Telegram.

## Продакшен

1. Добавьте все переменные окружения из `.env.example` в настройках проекта.
2. Деплойте как Next.js приложение.
3. Проверьте, что `TELEGRAM_TMA_URL` указывает на прод-URL.

## Telegram webhook

1. Эндпоинт: `POST /api/tg/webhook`
2. Установить webhook:
   `npm run tg:webhook` (использует `NEXT_PUBLIC_APP_URL`)

## Безопасность

Проверка `initData` выполняется на сервере. Доступ к Firestore идет через клиентский SDK на сервере и подчиняется правилам безопасности Firestore. Не ослабляйте правила, иначе данные будут доступны любому.

## Миграции

Инструкции по обновлению см. в [MIGRATION.md](/F:/projects/casino-tracker/MIGRATION.md).
