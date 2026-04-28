const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api';

const ORIGIN =
  process.env.NEXT_PUBLIC_API_ORIGIN ?? 'http://localhost:3001';

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function parseResponse(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  let body = init.body;
  if (init.json !== undefined) {
    headers.set('content-type', 'application/json');
    body = JSON.stringify(init.json);
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    body,
    credentials: 'include',
  });
  const data = await parseResponse(res);
  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in data
        ? Array.isArray((data as { message: unknown }).message)
          ? (data as { message: string[] }).message.join(', ')
          : String((data as { message: unknown }).message)
        : res.statusText) || 'Request failed';
    throw new ApiError(message, res.status, data);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, json?: unknown) =>
    request<T>(path, { method: 'POST', json }),
  postForm: <T>(path: string, form: FormData) =>
    request<T>(path, { method: 'POST', body: form }),
  patchForm: <T>(path: string, form: FormData) =>
    request<T>(path, { method: 'PATCH', body: form }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export function assetUrl(src: string): string {
  if (!src) return src;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  if (src.startsWith('data:')) return src;
  if (src.startsWith('/')) return `${ORIGIN}${src}`;
  return `${ORIGIN}/${src}`;
}
