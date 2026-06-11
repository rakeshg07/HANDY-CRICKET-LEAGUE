const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = {
  get: async (endpoint: string, options: RequestInit = {}) => {
    return request(endpoint, { ...options, method: 'GET' });
  },
  post: async (endpoint: string, data: any, options: RequestInit = {}) => {
    return request(endpoint, {
      ...options,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      body: JSON.stringify(data),
    });
  },
  put: async (endpoint: string, data: any, options: RequestInit = {}) => {
    return request(endpoint, {
      ...options,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      body: JSON.stringify(data),
    });
  },
};

async function request(endpoint: string, options: RequestInit) {
  const url = `${API_URL}${endpoint}`;
  
  // Include credentials for cookies (access token)
  options.credentials = 'include';
  
  try {
    let response = await fetch(url, options);

    // Handle 401 Unauthorized (Access token expired)
    if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry original request
        response = await fetch(url, options);
      }
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      throw new Error(data?.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise;
  
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  
  return refreshPromise;
}
