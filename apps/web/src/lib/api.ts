const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type FetchOptions = {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    cache?: RequestCache;
    next?: NextFetchRequestConfig;
};

export async function apiClient<T>(
    endpoint: string,
    options: FetchOptions = {},
): Promise<T> {
    const { method = 'GET', body, headers = {}, cache, next } = options;

    const url = `${API_BASE_URL}/api${endpoint}`;

    const config: RequestInit & { next?: NextFetchRequestConfig } = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        cache,
        next,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
}

// Typed helper functions
export const api = {
    get: <T>(endpoint: string, options?: Omit<FetchOptions, 'method' | 'body'>) =>
        apiClient<T>(endpoint, { ...options, method: 'GET' }),

    post: <T>(endpoint: string, body: unknown, options?: Omit<FetchOptions, 'method' | 'body'>) =>
        apiClient<T>(endpoint, { ...options, method: 'POST', body }),

    put: <T>(endpoint: string, body: unknown, options?: Omit<FetchOptions, 'method' | 'body'>) =>
        apiClient<T>(endpoint, { ...options, method: 'PUT', body }),

    delete: <T>(endpoint: string, options?: Omit<FetchOptions, 'method' | 'body'>) =>
        apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};
