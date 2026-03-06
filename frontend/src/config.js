// frontend/src/config.js

export const CONFIG = {
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:6001/api',
    APP_NAME: import.meta.env.VITE_APP_NAME || 'INKLY',
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
};

/**
 * Resolves media paths to full URLs based on the current environment.
 * @param {string} path - The relative or absolute path of the media file.
 * @returns {string} The fully qualified URL.
 */
export const getMediaUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    // Strips '/api' from the base URL to point to the static file server root
    const baseUrl = CONFIG.API_URL.replace(/\/api$/, '');
    return `${baseUrl}${path}`;
};