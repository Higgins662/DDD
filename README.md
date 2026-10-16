# DDD — DropDadDeals site

The website for DropDadDeals. It shows the deals the price tracker writes to Supabase, with a price-history chart on every deal page.

Live at https://realpricedrops.vercel.app (the Vercel project and URL still use the old name `realpricedrops`).

## How it works

- Next.js 15 (App Router).
- Every page reads Supabase when it's opened (`force-dynamic`, no caching), so new deals show up as soon as the tracker writes them. Nothing needs redeploying for new deals.
- The site reads only two read-only views in the `personalbudgetapp-amazon-experiment` Supabase project:
  - `public_deals`: deals with status `ready` or `posted`, minus test rows. The category comes from the eBay search keyword in each link.
  - `public_price_history`: price checks for those deals only.

  The publishable key in `lib/data.js` can read only these views. It can't read or change any other table. You can override it with the `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` environment variables.
- Set `SITE_URL` in Vercel once a custom domain is added, so the sitemap and link previews use it.

## What's where

| Path | What it is |
| --- | --- |
| `app/page.js` | Home page: live deals, category chips, "Recently ended" |
| `app/deal/[id]/page.js` | Deal page: price, savings, price-history chart, affiliate button |
| `app/category/[slug]/page.js` | Deals in one category |
| `app/about`, `app/disclosure` | How it works, affiliate disclosure |
| `app/opengraph-image.js` | Link-preview image (matches the Facebook banner) |
| `app/icon.svg`, `app/apple-icon.js`, `public/logo.svg` | Price-tag logo from the Facebook avatar |
| `app/globals.css` | Brand colors and layout |
| `lib/data.js` | Supabase reads and deal logic (ended deals, discounts, "lowest tracked") |
| `lib/brand.js` | Brand colors, logo SVG, fonts for generated images |

## Deal rules

- The price shown is the latest price check if it's newer than the deal. The discount is recalculated from that price.
- If the price went back up, the deal moves to "Recently ended" and is hidden from search engines.
- "Lowest tracked" appears only after at least 3 price checks.
- Every affiliate link is marked `rel="sponsored"` and has a disclosure next to it, plus one in the footer.

## Run it locally (optional)

Requires Node.js 20 or newer.

```
npm install
npm run dev
```

Then open http://localhost:3000.
