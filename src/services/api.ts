const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
};

function responseErrorMessage(status: number, path: string, body: string): string {
  const trimmed = body.trim();
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('<!doctype') || lower.startsWith('<html')) {
    return `API mengembalikan HTML untuk ${path}. Periksa VITE_API_BASE_URL atau route backend.`;
  }
  if (!trimmed) {
    return `API request failed: ${status}`;
  }
  return `API request failed: ${status} - ${trimmed.slice(0, 160)}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = isFormData
    ? {}
    : { 'Content-Type': 'application/json' };

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        ...headers,
        ...((options.headers as Record<string, string> | undefined) || {}),
      },
      ...options,
    });
  } catch (err) {
    throw new Error(
      err instanceof TypeError
        ? `Gagal terhubung ke API (${API_BASE_URL}). Pastikan backend aktif dan CORS/base URL benar.`
        : 'Gagal terhubung ke API.'
    );
  }

  const text = await response.text();
  let payload: ApiResponse<T> | T | undefined;
  if (text.trim()) {
    try {
      payload = JSON.parse(text) as ApiResponse<T> | T;
    } catch {
      throw new Error(responseErrorMessage(response.status, path, text));
    }
  }

  const apiPayload = payload as ApiResponse<T> | undefined;
  const hasApiEnvelope = typeof apiPayload?.success === 'boolean';
  if (!response.ok || (hasApiEnvelope && !apiPayload.success)) {
    if ((response.status === 401 || response.status === 403) && path !== '/auth/login') {
      window.dispatchEvent(new Event('studiku:auth-expired'));
    }
    throw new Error(
      (hasApiEnvelope && (apiPayload.error || apiPayload.message)) ||
        responseErrorMessage(response.status, path, text)
    );
  }

  if (!hasApiEnvelope) {
    return payload as T;
  }
  return apiPayload.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  postFormData: <T>(path: string, body: FormData) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
