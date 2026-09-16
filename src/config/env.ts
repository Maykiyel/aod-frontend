/** Runtime config, read once at module load. `VITE_API_URL` is the origin only;
 *  the `/api` prefix is appended here so call sites write `/login`. */
const origin = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000';

const read = (key: string) => {
  const value = import.meta.env[key] as string | undefined;
  return value?.trim() ? value.trim() : null;
};

export const env = {
  apiUrl: `${origin.replace(/\/+$/, '')}/api`,
  /** Laravel registers channel authorisation outside the `/api` prefix. */
  broadcastAuthUrl: `${origin.replace(/\/+$/, '')}/broadcasting/auth`,
  /** Null in a checkout with no broadcast credentials, which resolves to an
   *  adapter that connects to nothing and says so (spec #38). */
  pusherKey: read('VITE_PUSHER_APP_KEY'),
  pusherCluster: read('VITE_PUSHER_APP_CLUSTER') ?? 'mt1',
} as const;
