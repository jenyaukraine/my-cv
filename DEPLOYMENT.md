# Hosting and analytics

The existing CV, its EN/DE content, project gallery and original PDF downloads are preserved. Additional profile material describes the confirmed digital-signage work and the wider project portfolio. Analytics are isolated in `app.js`, `analytics.css` and the Node server.

## CV presentation

The default theme follows `prefers-color-scheme` from the browser/device. A deliberate choice through the existing theme switch is stored locally and takes precedence. The Auto button clears that override. Without a manual choice, a device-theme change updates the CV automatically.

Day mode uses light reading panels with dark text. Night mode keeps the same reading-panel structure and enables `matrix-world.js` and `matrix-world.css`: sparse code rain only in the outer gutters, decorative elevators centred beside sections and a sprite travelling between them in response to scrolling. The background intensifies gently over 65 seconds of visible-page animation time, with capped stream density; the character enters after six seconds. Motion pauses when the document is hidden, can be paused using the on-page control, and respects reduced-motion preferences. Decorations never capture pointer input. Text remains in foreground panels.

`music-invite.js` creates a persistent floating Pentaloop player and a matching inline player. Initial volume is 30%; playback is attempted on load. Browser autoplay policies may require a first click. Both players share playback state, elapsed/duration labels, seeking and a speaker mute control. Music subtly modulates the night animation through Web Audio when available. Theme and music scripts must retain their versioned asset URLs when edited to avoid stale browser caches.

## Addresses

- Existing GitHub Pages: https://jenyaukraine.github.io/my-cv/
- Server fallback: https://inkora.at/cv/
- Server admin: https://inkora.at/cv/admin
- Prepared custom domain: https://punchenko.de/ and https://punchenko.de/admin

The custom domain needs an A record for `@` to `128.140.104.253`. `www` may use a CNAME to `punchenko.de`. Caddy issues HTTPS certificates automatically once DNS resolves to the server. Do not set a GitHub Pages CNAME: the custom domain points to the server application.

## Runtime

Node 24, built-in HTTP and SQLite; no third-party runtime packages. The application runs as a non-root Docker user with a persistent `/opt/eugen-portfolio/data` volume and is attached to the existing `incora_default` network. Only Caddy exposes it publicly. Application source is in `/opt/eugen-portfolio/app`; runtime password configuration is in `/opt/eugen-portfolio/.env`, outside the repository.

`docker compose -f /opt/eugen-portfolio/compose.yml --project-directory /opt/eugen-portfolio up -d --build` rebuilds after synchronising application source. Back up the whole data directory while the container is stopped, or use SQLite's online backup API. Never replace the data directory during deployment.

`ADMIN_PASSWORD_HASH` must contain a salted scrypt hash. Generate it with `node scripts/admin-password.mjs`, supplying the password on stdin. The login name is `admin`. No password or hash belongs in Git. Admin sessions expire after eight hours and after process restart. Login attempts are rate-limited; the cookie is HttpOnly, Secure in production and SameSite=Strict.

## Analytics definitions

- Views: page loads with JavaScript analytics enabled, including repeat loads.
- Today: Europe/Kyiv calendar day.
- Active: anonymous visible-tab identifiers seen within 90 seconds; approximate rather than a count of distinct people.
- Sources: referrer hostname or `utm_source`; campaigns: `utm_campaign`.
- Actions: clicks on PDF, email and GitHub links. A click does not establish that a message was sent.

Details are retained for up to 90 days; lifetime page-load total is preserved separately. The application does not store raw IP addresses, full referrer URLs or account identities. Do Not Track disables event submission. Add `?preview=1` during QA to avoid creating visits. Counts can be affected by blockers and automated clients.

The admin dashboard also edits the existing summary paragraph and work-format line in English and German. All other CV sections and PDF files remain maintained in Git. GitHub Pages fetches profile overrides and analytics from the server over restricted CORS; if the API is unavailable the original CV text remains and counters show an unavailable state.

Campaign example: `https://inkora.at/cv/?utm_source=linkedin&utm_campaign=php-roles`.

## Checks

Run `npm test` for integration coverage of analytics, origin checks, admin access, profile edits, logout, persistence and private-file protection. The original `styles.css` and both original PDFs remain unchanged. `theme.js` keeps the existing theme/project/gallery/music functionality, follows the system theme by default and hands the former hero-only animation off to the separate full-page animation module.

The public counter shows unique anonymous browsers and currently active tabs. Lifetime unique-browser hashes are retained separately from the 90-day page-load detail. Unique tracking starts with this feature; earlier page loads are not backfilled as unique people. See privacy.html.

The sticky terminal-style navigation includes text search and current-section highlighting. The visual technology map preserves the original stack details in an expandable section. Brand icons come from Simple Icons; cinematic header and transparent character strip were generated with ImageGen.
