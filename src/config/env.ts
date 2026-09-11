/**
 * Runtime configuration, read once from Vite's env at module load.
 *
 * `VITE_API_URL` is the backend's origin with no trailing path — the `/api`
 * prefix is Laravel's and is appended here, so call sites write `/login` rather
 * than repeating `/api` at every one of them.
 */
const origin = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000';

export const env = {
  apiUrl: `${origin.replace(/\/+$/, '')}/api`,
} as const;
