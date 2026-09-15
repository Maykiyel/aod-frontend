/** Middleware is behind `v8_middleware` in react-router 7.18.3 — the flag is
 *  what makes route-level `middleware` run at all, so every router this app
 *  creates, the memory router tests mount included, must carry it. */
export const routerFuture = { v8_middleware: true } as const;

declare module 'react-router' {
  interface Future {
    v8_middleware: true;
  }
}
