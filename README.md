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

# Starting app

For Local development(nodemon) :-
```
yarn dev
```

For Production(pm2)
```
yarn start
```
