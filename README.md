# cms.v1

Admin panel for my portfolio. Edit profile, skills (planets), projects, experience, education, media and read contact messages.

**Stack:** React 19 · Vite · TanStack Query · Tailwind 4 — deployed on **Vercel**.
Talks to [portfolio-cms.api.v1](https://github.com/Pheakkorny/portfolio-cms.api.v1); changes appear on [portfolio.tech.v1](https://github.com/Pheakkorny/portfolio.tech.v1) within seconds.

## Run locally
```bash
pnpm install
cp .env.example .env
pnpm dev            # http://localhost:5173
```
Log in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you seeded on the API.

## Deploy to Vercel
Import the repo (framework: Vite) and set:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://<api>.onrender.com/api/v1` |
| `VITE_PORTFOLIO_URL` | `https://<portfolio>.vercel.app` |

`vercel.json` rewrites all routes to `index.html` for client-side routing. Add the CMS URL to the API's `CORS_ORIGINS`.

Images upload directly from the browser to Cloudinary using a signature from the API.
