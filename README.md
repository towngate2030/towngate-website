# TownGate website

Next.js (App Router) + Tailwind CSS v4 + **next-intl** for **Arabic / English** (`/ar`, `/en`), RTL/LTR, TownGate brand colors (navy `#002B49`, orange `#FF6600`, cream `#FAF8F5`), featured **projects** (seed data in [`lib/projects.ts`](lib/projects.ts)), **contact** API with optional **Resend**, and **WhatsApp** CTA + floating button.

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — middleware redirects to `/ar` by default.

## Push to GitHub (first time)

1. On [GitHub](https://github.com/new), create a **new empty repository** (no README/license) — e.g. `TownGate-Website`.
2. In this folder, connect and push (replace `YOUR_USER` and `YOUR_REPO`):

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

If GitHub shows **HTTPS** or **SSH**, use the URL it gives you for `origin`. After the first push, connect the repo in Vercel as below.

## Environment

Copy [`.env.example`](.env.example) to `.env.local` and fill values. At minimum for production:

- `NEXT_PUBLIC_SITE_URL` — your live URL (SEO + metadata).
- `NEXT_PUBLIC_WHATSAPP_E164` — WhatsApp in E.164 **without** `+` (default `966593053792`).

For the contact form to send email:

1. Create a [Resend](https://resend.com) account and API key.
2. Verify your domain in Resend (recommended) and set `RESEND_FROM` to:
   - `Town Gate <no-reply@towngate-eg.com>`
3. Set `RESEND_API_KEY` from Resend.
4. Set `CONTACT_EMAIL` to the inbox that should receive leads (e.g. `Towngate2030@gmail.com`).

Note: If the domain is not verified yet, Resend may restrict sending (you'll get a `403 validation_error`).

**Newsletter:** the footer form posts to `POST /api/newsletter`. With Resend configured, you receive an email per subscriber at `CONTACT_EMAIL`; otherwise the address is logged in server logs (set up Resend on Vercel for production).

## Hidden admin URL (no button on the site)

There is **no admin link** in the public UI. A placeholder internal page lives at:

`/tg-cp-internal`

Example: `https://your-deployment.vercel.app/tg-cp-internal`

This is **obscurity, not security** — change the folder name (and the `tg-cp-internal` string in [`middleware.ts`](middleware.ts) matcher) to something only your team knows, then add real authentication before any sensitive actions.

## Logo asset

Replace or add a high-res PNG at `public/brand/towngate-logo.png` if you export one from the official artwork. The header uses [`public/brand/towngate-mark.svg`](public/brand/towngate-mark.svg) as a lightweight fallback.

## Deploy on Vercel

1. Push this repo to GitHub.
2. In [Vercel](https://vercel.com) → **Add New Project** → import the repo.
3. Framework preset: **Next.js**. Root directory: repo root (where `package.json` lives).
4. Add environment variables from `.env.example`.
5. Deploy.

## Cloudflare (DNS)

If the domain’s DNS is on Cloudflare:

1. Add the domain in Vercel and follow Vercel’s DNS records (usually `A`/`CNAME` to `cname.vercel-dns.com` or Vercel-supplied targets).
2. In Cloudflare → **DNS**, create the records Vercel shows. Turn **Proxy** (orange cloud) on or off per your preference; SSL mode **Full (strict)** works well with Vercel.
3. Avoid duplicate `A` records pointing elsewhere.

## Admin / CMS

This repo uses **Sanity** for admin content editing (projects, hero, Why TownGate, WhatsApp contacts).

- Admin UI is hosted by Sanity (access via [Sanity Manage](https://www.sanity.io/manage))
- Public site reads from Sanity via `@sanity/client`

Set the required Sanity environment variables from [`.env.example`](.env.example).

## Scripts

| Command   | Description        |
| --------- | ------------------ |
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm run lint` | ESLint             |
