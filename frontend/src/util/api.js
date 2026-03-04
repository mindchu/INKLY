import { CONFIG } from '../config';

const handleResponse = async (response) => {
    if (!response.ok) {
        if (response.status === 401) {
            // Redirect to signin if unauthorized, but only if not already on the signin page
            if (window.location.pathname !== '/signin') {
                window.location.href = '/signin';
            }
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'API request failed');
    }
    return response.json();
};

export const api = {
    get: async (endpoint) => {
        const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            credentials: 'include',
        });
        return handleResponse(response);
    },

    post: async (endpoint, data, isFormData = false) => {
        const headers = {
            'Accept': 'application/json',
        };
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
            method: 'POST',
            headers: headers,
            body: isFormData ? data : JSON.stringify(data),
            credentials: 'include',
        });
        return handleResponse(response);
    },

    put: async (endpoint, data) => {
        const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include',
        });
        return handleResponse(response);
    },

    delete: async (endpoint) => {
        const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
            },
            credentials: 'include',
        });
        return handleResponse(response);
    },
};
