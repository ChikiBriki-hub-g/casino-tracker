# Деплой на Vercel (Next.js)

## 1. Подготовка Git-репозитория

1. Создайте новый репозиторий на GitHub (пустой, без README и .gitignore).
2. В корне проекта выполните команды:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<USER>/<REPO>.git
git push -u origin main
```

## 2. Импорт проекта в Vercel

1. Откройте Vercel Dashboard → **Add New** → **Project**.
2. Выберите репозиторий с GitHub и нажмите **Import**.
3. Framework Vercel определит автоматически как **Next.js**.
4. Нажмите **Deploy** (можно сразу, env добавим на следующем шаге).

## 3. Настройка переменных окружения

В Vercel → Project → **Settings** → **Environment Variables** добавьте:

```
NEXT_PUBLIC_API_BASE_URL= (оставьте пустым, если фронт и API на одном домене)
NEXT_PUBLIC_APP_URL=https://<your-domain>

FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...

TELEGRAM_BOT_TOKEN=...
TELEGRAM_TMA_URL=https://<your-domain>
TELEGRAM_WELCOME_TEXT=Welcome text
TELEGRAM_WELCOME_BUTTON_TEXT=trecker
TMA_AUTH_MAX_AGE_SEC=86400
```

Важно:
- `NEXT_PUBLIC_API_BASE_URL` может быть пустым, если API и фронт на одном домене.
- `NEXT_PUBLIC_APP_URL` нужен для установки webhook скриптом.
- `TELEGRAM_TMA_URL` должен указывать на прод-URL мини-приложения.

После добавления env нажмите **Redeploy**.

## Telegram webhook

1. Эндпоинт: `POST /api/tg/webhook`
2. Установить webhook:
   `npm run tg:webhook` (использует `NEXT_PUBLIC_APP_URL`)
3. Команду можно выполнить локально после деплоя, если в `.env` заполнены `TELEGRAM_BOT_TOKEN` и `NEXT_PUBLIC_APP_URL`.
4. Для автоматизации есть GitHub Action `.github/workflows/set-telegram-webhook.yml`.
   Нужно добавить `TELEGRAM_BOT_TOKEN` и `NEXT_PUBLIC_APP_URL` в GitHub Secrets.

## 4. Подключение домена (опционально)

1. В Vercel → Project → **Settings** → **Domains** добавьте домен.
2. Обновите DNS записи по инструкции Vercel.
3. После активации домена обновите `TELEGRAM_TMA_URL`.

## 5. Проверка

1. Откройте прод-URL и убедитесь, что приложение загружается.
2. В Telegram проверьте, что `initData` проходит проверку:
   - `/api/tma/verify`
   - `/api/tma/send-welcome`
3. Проверьте, что данные сохраняются и читаются через `/api/user/get` и `/api/user/save`.
