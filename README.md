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
2. Set `RESEND_API_KEY` and `RESEND_FROM` (verified domain or Resend test sender).
3. Set `CONTACT_EMAIL` to the inbox that should receive leads (e.g. `Towngate2030@gmail.com`).

Without `RESEND_API_KEY`, `POST /api/contact` still returns success but only logs the payload on the server (useful for local dev).

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

## Admin / CMS (next step)

Project copy and images are currently **code-driven** in `lib/projects.ts` for a fast ship. To let admins add projects without deploys, add **Sanity** (or Payload + MongoDB) and replace `getProjects()` with a CMS client — see the product plan for bilingual fields (`titleAr` / `titleEn`, etc.).

## Scripts

| Command   | Description        |
| --------- | ------------------ |
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm run lint` | ESLint             |
