// Centralized API client with:
// - Base URL from EXPO_PUBLIC_API_URL
// - Firebase ID token attachment with caching and single-flight fetch
// - 429-aware retry with exponential backoff and jitter, Retry-After support
// - Simple in-memory cache for GETs with TTL
// - Request de-duplication for idempotent requests

import { getAuth } from 'firebase/auth';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ApiOptions = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  // Cache TTL in ms for GET requests (0 disables cache)
  ttlMs?: number;
  // Unique key override for dedupe/cache; defaults to method+url+body
  key?: string;
  // Abort signal from caller
  signal?: AbortSignal;
};

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

// Simple in-memory caches
const tokenCache: { token?: string; exp?: number; inFlight?: Promise<string> } = {};
const responseCache = new Map<string, { exp: number; data: any }>();
const inflightRequests = new Map<string, Promise<any>>();

// Get Firebase ID token with caching. Avoid force refresh unless needed.
async function getIdTokenCached(): Promise<string> {
  const now = Date.now();
  if (tokenCache.token && tokenCache.exp && tokenCache.exp - 30_000 > now) {
    return tokenCache.token;
  }
  if (tokenCache.inFlight) return tokenCache.inFlight;

  tokenCache.inFlight = (async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    // Do NOT force refresh by default to reduce token endpoint calls
    const token = await user.getIdToken(false);
    // Derive an expiry ~55 minutes from now (Firebase tokens are typically 1h)
    const exp = now + 55 * 60_000;
    tokenCache.token = token;
    tokenCache.exp = exp;
    tokenCache.inFlight = undefined;
    return token;
  })();

  try {
    return await tokenCache.inFlight;
  } finally {
    tokenCache.inFlight = undefined;
  }
}

function buildKey(url: string, method: HttpMethod, body: any, override?: string) {
  if (override) return override;
  const bodyKey = body ? JSON.stringify(body) : '';
  return `${method} ${url} ${bodyKey}`;
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function getRetryAfterMs(res: Response, attempt: number) {
  const retryAfter = res.headers.get('Retry-After');
  if (retryAfter) {
    const asInt = parseInt(retryAfter, 10);
    if (!Number.isNaN(asInt)) return asInt * 1000;
    const date = Date.parse(retryAfter);
    if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  }
  // exponential backoff with jitter (base 500ms)
  const base = 500 * Math.pow(2, attempt);
  const jitter = Math.random() * 200;
  return base + jitter;
}

export async function apiFetch<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  if (!BASE_URL) throw new Error('Missing EXPO_PUBLIC_API_URL');
  const method: HttpMethod = (options.method ?? 'GET').toUpperCase() as HttpMethod;
  const url = `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const key = buildKey(url, method, options.body, options.key);

  // Serve from cache if GET and fresh
  if (method === 'GET' && options.ttlMs && options.ttlMs > 0) {
    const cached = responseCache.get(key);
    if (cached && cached.exp > Date.now()) {
      return cached.data as T;
    }
  }

  // Dedupe idempotent GET requests
  if (method === 'GET') {
    const inflight = inflightRequests.get(key);
    if (inflight) return inflight as Promise<T>;
  }

  const exec = (async () => {
    let token = '';
    try {
      token = await getIdTokenCached();
    } catch (e) {
      // Allow unauthenticated endpoints if needed
      // But most of our API requires auth; rethrow for clarity
      throw e;
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
    };

    const init: RequestInit = {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    };

    // Retry loop
    let attempt = 0;
    const maxAttempts = 3;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const res = await fetch(url, init);
      if (res.status === 401 || res.status === 403) {
        // Try one forced refresh once
        if (attempt === 0) {
          const auth = getAuth();
          const user = auth.currentUser;
          if (!user) throw new Error('Not authenticated');
          token = await user.getIdToken(true);
          tokenCache.token = token; // refresh cache
          tokenCache.exp = Date.now() + 55 * 60_000;
          init.headers = { ...headers, Authorization: `Bearer ${token}` };
          attempt++;
          continue;
        }
      }

      if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
        if (attempt < maxAttempts - 1) {
          const waitMs = getRetryAfterMs(res, attempt);
          await sleep(waitMs);
          attempt++;
          continue;
        }
      }

      if (!res.ok) {
        const text = await safeText(res);
        throw new Error(`API error ${res.status}: ${text}`);
      }

      const data = await res.json();
      // Cache GETs
      if (method === 'GET' && options.ttlMs && options.ttlMs > 0) {
        responseCache.set(key, { exp: Date.now() + options.ttlMs, data });
      }
      return data as T;
    }
  })();

  if (method === 'GET') inflightRequests.set(key, exec);
  try {
    return await exec;
  } finally {
    if (method === 'GET') inflightRequests.delete(key);
  }
}

async function safeText(res: Response) {
  try {
    return await res.text();
  } catch (e) {
    return '<no body>';
  }
}

// Convenience helpers for common patterns
export const api = {
  get: <T = any>(path: string, opts: Omit<ApiOptions, 'method'> = {}) => apiFetch<T>(path, { ...opts, method: 'GET' }),
  post: <T = any>(path: string, body?: any, opts: Omit<ApiOptions, 'method' | 'body'> = {}) =>
    apiFetch<T>(path, { ...opts, method: 'POST', body }),
  put: <T = any>(path: string, body?: any, opts: Omit<ApiOptions, 'method' | 'body'> = {}) =>
    apiFetch<T>(path, { ...opts, method: 'PUT', body }),
  patch: <T = any>(path: string, body?: any, opts: Omit<ApiOptions, 'method' | 'body'> = {}) =>
    apiFetch<T>(path, { ...opts, method: 'PATCH', body }),
  delete: <T = any>(path: string, opts: Omit<ApiOptions, 'method'> = {}) => apiFetch<T>(path, { ...opts, method: 'DELETE' }),
};
