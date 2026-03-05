export const CONFIG = {
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:6001/api',
    APP_NAME: import.meta.env.VITE_APP_NAME || 'INKLY',
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
};
