# Sanctum bearer token, kept in localStorage

The API is token-based: `login` and `register` return a Sanctum
`plainTextToken`, everything sits behind `auth:sanctum`, and `bootstrap/app.php`
states outright that there are no session cookies. We keep that token in
`localStorage`, attach it through a single axios instance, and set
`withCredentials: false` with no CSRF handling anywhere.

The design handoff prescribes the opposite — session auth with `withCredentials`
and a CSRF header. It is wrong about this backend, and following it produces a
login that succeeds and every subsequent call returning 401.

## Consequences

`localStorage` is readable by any injected script. Accepted: the app loads no
third-party JavaScript, and the alternatives cost a re-login on every refresh
during development. Revisit if third-party scripts are ever introduced.

Echo uses a custom authorizer routed through the same axios instance, so the
bearer header reaches `/broadcasting/auth` as well. That path is not in Laravel's
default CORS paths, which made every private-channel subscription fail silently
at the preflight; fixed in Joe-Zupo/aod-backend#18.
