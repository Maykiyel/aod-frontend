# Sanctum bearer token, kept in localStorage

The API is token-based: `login` and `register` return a Sanctum
`plainTextToken`, everything sits behind `auth:sanctum`, and `bootstrap/app.php`
states outright that there are no session cookies. We keep that token in
`localStorage`, attach it through a single axios instance, and set
`withCredentials: false` with no CSRF handling anywhere.

The design handoff prescribes the opposite — session auth with `withCredentials`
and a CSRF header. It is wrong about this backend, and following it produces a
login that succeeds and every subsequent call returning 401.

## Why axios rather than fetch

Added 2026-09-11, after this decision was briefly departed from and reversed.
The original text named axios without saying why, which made it look incidental
to the real decision (the bearer token) and easy to substitute. It is not.

**Upload progress.** Ticket #8 requires each player's recording to upload "with
visible progress". The Fetch API has no upload-progress event; streaming request
bodies need `duplex: 'half'`, are effectively Chrome-only, and still do not
surface progress. The only browser mechanism is `XMLHttpRequest.upload.onprogress`,
which axios wraps as `onUploadProgress` because its browser adapter is XHR. This
alone settles it.

**The Echo authorizer**, described below, routes through the same instance.

**Familiarity.** The maintainer works in axios by preference. For a three-week
prototype that is a real consideration, not a soft one.

Splitting the difference — fetch for JSON, XHR only for the upload — was
considered and rejected: it scatters auth and envelope handling across two
transports, which is exactly what a single configured client exists to prevent.

## Consequences

`localStorage` is readable by any injected script. Accepted: the app loads no
third-party JavaScript, and the alternatives cost a re-login on every refresh
during development. Revisit if third-party scripts are ever introduced.

Echo uses a custom authorizer routed through the same axios instance, so the
bearer header reaches `/broadcasting/auth` as well. That path is not in Laravel's
default CORS paths, which made every private-channel subscription fail silently
at the preflight; fixed in Joe-Zupo/aod-backend#18.
