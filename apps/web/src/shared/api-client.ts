/* Minimal shared API client for Phase 1
 * Uses VITE_API_URL when provided, otherwise falls back to same-origin.
 */
import { z } from 'zod';

// Zod schema for /health response
export const HealthSchema = z.object({
  status: z.string().optional(),
});
export type HealthOk = z.infer<typeof HealthSchema>;
export type HealthErr = { error: string };

const baseFromEnv = (import.meta as any).env?.VITE_API_URL
  ? String((import.meta as any).env.VITE_API_URL).replace(/\/+$/, '')
  : '';

function healthUrl(base: string) {
  return `${base || ''}/health`;
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

async function fetchHealth(): Promise<HealthOk | HealthErr> {
  const url = healthUrl(baseFromEnv);
  try {
    const data = (await fetchJson(url)) as unknown;
    const parsed = HealthSchema.safeParse(data);
    if (parsed.success) {
      return parsed.data;
    }
    if (import.meta && (import.meta as any).env?.DEV) {
      // eslint-disable-next-line no-console
      console.warn('HealthSchema validation failed:', parsed.error?.issues);
    }
    return { error: 'Invalid health response' };
  } catch (e: any) {
    return { error: e?.message ?? 'Network error' };
  }
}

export const apiClient = {
  baseUrl: baseFromEnv,
  fetchHealth,
 };