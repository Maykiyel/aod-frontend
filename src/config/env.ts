/** Runtime config, read once at module load. `VITE_API_URL` is the origin only;
 *  the `/api` prefix is appended here so call sites write `/login`. */
const origin = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000';

export const env = {
  apiUrl: `${origin.replace(/\/+$/, '')}/api`,
} as const;
