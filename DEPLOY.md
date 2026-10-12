# Deploying Fihh (site + Wisp on one server)

`server.mjs` serves the built site and the Wisp server on one port, so any host that runs a Docker container or Node app can run it. The Wisp address is picked up automatically from the page's own address (`wss://YOUR-HOST/wisp/`).

## Test it on your own computer first

1. `pnpm install` (no `--frozen-lockfile`)
2. `cd packages/core && pnpm rewriter:build && pnpm build`
3. `cd ../demo && pnpm build`
4. `cd ../.. && pnpm start`
5. Open http://localhost:8080 and search for a site.

## Deploy on Render (Docker)

1. Push these files to GitHub.
2. Sign in at render.com with GitHub.
3. New > Web Service > pick your repo. Render finds the `Dockerfile`; choose the Free instance type. (Or New > Blueprint to use `render.yaml`.)
4. Create Web Service and wait for the build. The first build compiles Rust and can take a long time. If it fails with an out-of-memory or time-limit error, the free tier is too small: use a paid instance, or another host (Fly.io, Railway, Koyeb).
5. Open the `https://YOUR-NAME.onrender.com` address Render shows. Free services sleep when idle, so the first load after a break is slow.

## Notes

- HTTPS is required for the service worker; Render provides it.
- The server blocks visitors from reaching private/loopback addresses on the host.
- Put the final address into the about:blank launcher's `PROXY_URL`.
