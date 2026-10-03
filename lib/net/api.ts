import {
  ApiError,
  GameMode,
  LeaderboardResponse,
  Scope,
  StatsResponse,
  SubmitRunRequest,
  SubmitRunResponse,
} from '@/types/api';

const TIMEOUT_MS = 5000;

export class ApiRequestError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...init,
      signal: ctrl.signal,
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    });
    const data = (await res.json().catch(() => null)) as T | ApiError | null;
    if (!res.ok) {
      const msg = data && typeof data === 'object' && 'error' in data ? data.error : `HTTP ${res.status}`;
      throw new ApiRequestError(res.status, msg);
    }
    return data as T;
  } finally {
    clearTimeout(timer);
  }
}

export function postRun(run: SubmitRunRequest) {
  return request<SubmitRunResponse>('/api/runs', { method: 'POST', body: JSON.stringify(run) });
}

export function getLeaderboard(scope: Scope = 'today', limit = 10, mode: GameMode = 'solo') {
  return request<LeaderboardResponse>(`/api/leaderboard?scope=${scope}&limit=${limit}&mode=${mode}`);
}

export function getStats(scope: Scope = 'today', score?: number, mode: GameMode = 'solo') {
  const s = score === undefined ? '' : `&score=${score}`;
  return request<StatsResponse>(`/api/stats?scope=${scope}&mode=${mode}${s}`);
}

/** Oyuna başlamadan önce ismi sunucuda kontrol eder (uygunsuz isim filtresi). */
export function checkNick(nick: string) {
  return request<{ ok: true; nick: string }>('/api/nick', { method: 'POST', body: JSON.stringify({ nick }) });
}
