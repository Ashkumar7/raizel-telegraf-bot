# raizel-telegraf-bot

Telegram bot made using telegraf framework for downloading from real-debrid api.

# Environment variables

create a `.env.local` in root directory and set required value:-

```
TELEGRAM_BOT_TOKEN=
REAL_DEBRID_API_TOKEN=
POSTGRES_URL=

# If getting error with pm2 --no-daemon
PIDUSAGE_USE_PS=true

# Required if 'ip_not_allowed'
PROXY_HOST=
PROXY_PORT=
PROXY_USERNAME=
PROXY_PASSWORD=
```

# Database

Create a migration file using:-

```bash
npm run migration:generate
```

Run migration using:-

```bash
npm run migration:migrate
```

Push migration to database using:-

```bash
npm run migration:push
```

# Starting app

For Local development(nodemon) :-

```bash
npm run dev
```

For Production(pm2)

```bash
npm run start
```
