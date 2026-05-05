// src/lib/api.ts
import { auth } from '$lib/stores/auth.svelte';
const API_BASE_URL = "/api";

type FetchOptions = RequestInit & {
    customHeaders?: Record<string, string>;
};

async function fetchWrapper(endpoint: string, options: FetchOptions = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Default headers
    const headers: Record<string, string> = {
        'Accept': 'application/json',
        ...options.customHeaders
    };

    // Jika bukan FormData, tambahkan Content-Type json
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    // Sisipkan Authorization token jika user sedang login
    if (auth.token) {
        headers['Authorization'] = `Bearer ${auth.token}`;
    }

    const config: RequestInit = {
        ...options,
        credentials: 'include',
        headers
    };

    try {
        const response = await fetch(url, config);
        
        // Handle response jika status 401 Unauthorized (Token expired/invalid)
        if (response.status === 401) {
            auth.logout(); // Paksa logout
            if (typeof window !== "undefined") {
                window.location.href = "/login?session_expired=true";
            }
            throw new Error('Unauthorized');
        }

        // Parsing JSON
        const data = await response.json().catch(() => null);

        if (!response.ok) {
            // Handle HTTP errors
            const errorMessage = data?.message || response.statusText || 'Terjadi kesalahan pada server';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

export const api = {
    get: (endpoint: string, options?: FetchOptions) => 
        fetchWrapper(endpoint, { ...options, method: 'GET' }),
        
    post: (endpoint: string, body: any, options?: FetchOptions) => 
        fetchWrapper(endpoint, { 
            ...options, 
            method: 'POST', 
            body: body instanceof FormData ? body : JSON.stringify(body) 
        }),
        
    put: (endpoint: string, body: any, options?: FetchOptions) => 
        fetchWrapper(endpoint, { 
            ...options, 
            method: 'PUT', 
            body: body instanceof FormData ? body : JSON.stringify(body) 
        }),
        
    delete: (endpoint: string, options?: FetchOptions) => 
        fetchWrapper(endpoint, { ...options, method: 'DELETE' })
};
