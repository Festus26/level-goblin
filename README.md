# Level Goblin

A free, ad-free level tracker for fantasy card games. Each player uses their own phone, or the whole table shares one.

## Develop

```sh
npm install
npm run dev                  # website
npm run dev -w worker        # session server, in a second terminal
npm test                     # rules and server tests
npm run test:e2e             # real-browser tests
```

For local multiplayer, run the Worker with `--var ALLOWED_ORIGINS:http://localhost:5173`.

## Layout

- `shared/`: game rules and the message format, used by both sides
- `web/`: the React site, with art in `web/src/art` and the UI brief in `web/art/brief.md`
- `worker/`: the Cloudflare Worker, with one Durable Object per session
- `e2e/`: Playwright tests

## Launch

1. Create a free Cloudflare account and move the domain's DNS to it. Stay on the Free plans.
2. From `worker/`, run `npx wrangler login`, then `npx wrangler deploy`. This serves the Worker at `https://api.semihyildirim.dev`. Don't use the `workers.dev` address, because some networks block it.
3. Create a public GitHub repo and push this project.
4. In the repo settings:
   - Under **Pages**, set the source to **GitHub Actions**.
   - Under **Secrets and variables > Actions > Variables**, add `API_URL` with `https://api.semihyildirim.dev`.
5. Add a DNS record: `CNAME levelgoblin -> festus26.github.io`, set to **DNS only**, or GitHub can't manage its certificate.
6. Re-run the deploy workflow, then enable **Enforce HTTPS** under Pages once GitHub offers it.

## Renaming

If the name changes, update `SITE_NAME` in `web/src/config.ts`, the manifest in `web/vite.config.ts`, the title in `web/index.html`, `web/public/CNAME`, and `ALLOWED_ORIGINS` in `worker/wrangler.jsonc`.

## Originality

All art is hand-written SVG. Don't add any publisher's art, characters, card names or card text.
