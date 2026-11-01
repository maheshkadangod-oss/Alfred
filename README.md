# alfiemax.com

Portfolio for Alfred Dominic, Solutions Architect and Full-Stack Engineer, Kochi.
Vite, GSAP, Lenis, and raw WebGL. Spiralvue green and graphite palette, Hanken Grotesk throughout. Same setup as the Evan Lee site.

## Edit the words
All copy lives in `src/content.js`. Lines marked `CONFIRM` disagree between the live site and LinkedIn,
or need Alfred's sign-off before launch.

## How it is built
- `src/render.js` turns content into HTML. `vite.config.js` runs it at build time so crawlers read the
  real numbers. (The old site showed "0+ Years" to Google because the counters started at zero.)
- `src/orb.js` is the particle system: 10,000 dots (5,000 on phones). On load they gather into a bomb,
  it blows, and the pieces land as Alfred's portrait. Scrolling bursts the portrait into dust that
  stays behind the whole site.
- `public/portrait.bin` holds the dot positions, sampled from his LinkedIn headshot with the background removed.
  `public/portrait-night.bin` is the night laptop photo; preview it with `?face=night` on the URL.
- `src/main.js` has the intro, the scroll burst, the sideways work gallery, cursor, magnetic buttons,
  counters, ticker and timeline.
- People who turn off motion in their phone settings get a still hero with no burst.

## Search and AI answers (SEO, AEO, GEO)
- `src/seo.js` writes the head tags and one JSON-LD graph: Person, WebSite, ProfilePage, ItemList of
  products, FAQPage. It also writes `sitemap.xml`, `robots.txt` (AI crawlers allowed on purpose) and
  `llms.txt` (a plain summary for AI assistants). All from `src/content.js`, so they match the page.
- The page has one real H1 with his name and role; the big ALFIEMAX is decoration.
- The FAQ section is visible on the page, which Google requires for FAQ markup.
- `public/og-image.jpg` is the share image, drawn from the same dot portrait.
- After the domain points here, submit `https://alfiemax.com/sitemap.xml` in Google Search Console
  and Bing Webmaster Tools.

## Video
See `VIDEO-PROMPTS.md`.

## Run locally
```
npm install
npm run dev
```

## Deploy
Import this repo in Vercel. It detects Vite (build `npm run build`, output `dist`).
