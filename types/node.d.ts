declare namespace NodeJS {
  export interface ProcessEnv {
    POSTGRES_URL: string;
    TELEGRAM_BOT_TOKEN: string;
    REAL_DEBRID_API_TOKEN: string;
    PROXY_HOST: string;
    PROXY_PORT: string;
    PROXY_USERNAME: string;
    PROXY_PASSWORD: string;
  }
}
