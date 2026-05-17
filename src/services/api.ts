const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !payload.success) {
    if ((response.status === 401 || response.status === 403) && path !== '/auth/login') {
      window.dispatchEvent(new Event('studiku:auth-expired'));
    }
    throw new Error(payload.error || `API request failed: ${response.status}`);
  }
  return payload.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
