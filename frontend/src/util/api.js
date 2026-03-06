// frontend/src/util/api.js

import { CONFIG } from '../config';

const handleResponse = async (response) => {
    if (!response.ok) {
        if (response.status === 401) {
            // Redirect to signin if unauthorized, but only if not already there
            if (window.location.pathname !== '/signin') {
                window.location.href = '/signin';
            }
        }
        
        // Parse the error safely
        const errorData = await response.json().catch(() => ({}));
        
        // Fallback to errorData.message if errorData.detail isn't present
        throw new Error(errorData.detail || errorData.message || 'API request failed');
    }
    
    // Handle endpoints that return 204 No Content (e.g., successful deletes without a body)
    if (response.status === 204) {
        return null; 
    }
    
    return response.json();
};

/**
 * Core request wrapper to keep HTTP methods DRY
 */
const request = async (endpoint, options = {}) => {
    const url = `${CONFIG.API_URL}${endpoint}`;
    
    const defaultHeaders = {
        'Accept': 'application/json',
    };

    // Auto-detect FormData:
    // If body is NOT FormData and exists, stringify it and set JSON headers.
    // If it IS FormData, the browser automatically sets the Content-Type with the correct boundary.
    if (!(options.body instanceof FormData) && options.body) {
        defaultHeaders['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers, // Allow overriding headers if necessary
        },
        credentials: 'include', // Ensure cookies/sessions are sent
    };

    const response = await fetch(url, config);
    return handleResponse(response);
};

export const api = {
    get: (endpoint) => request(endpoint, { method: 'GET' }),
    
    post: (endpoint, data) => request(endpoint, { method: 'POST', body: data }),
    
    put: (endpoint, data) => request(endpoint, { method: 'PUT', body: data }),
    
    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};