# alfiemax.com: handover

Everything for the site is in this repo. All the words are in one file, `src/content.js`.
You never need to touch the animation code to change what the site says.

## 1. Confirm these before launch

Search `src/content.js` for `CONFIRM`. Each one is a place where your LinkedIn and the old site
disagreed, or where a line needs your yes.

| Line in `src/content.js` | What to check |
|---|---|
| `role` (near the top) | "Solutions Architect and Full-Stack Engineer". The old site said "Senior Full-Stack Engineer". |
| `rail` | "Open to select projects · 2026" runs down the right edge of the hero. Remove it if you're not taking work. |
| `stats` | 11+ years, 10+ products, 7 industries. |
| `photoCaption` | "Lead Engineer at GoZip" on the floating photo. |
| `experience`, first entry | LinkedIn says "Lead Engineer, Zip Moving Software". The old site said "Senior Full-Stack Engineer, GoZip". Pick one. |
| `experience`, MakeMine | Founder & CEO, 2018 to now. It wasn't on the old site. |
| `experience`, Version One Labs | The old site says 2017 to 2021. LinkedIn says Oct 2019 to present. |
| `faq`, freelance answer | Says you take a small number of freelance and consulting projects each year. |

Also check `src/seo.js`, line with `worksFor`: the company name Google sees. Keep it the same as the first experience entry.

## 2. Run it on your machine

```bash
npm install
npm run dev
```

Open the address it prints. Edits to `src/content.js` show up straight away.

## 3. Deploy

Import the repo in Vercel. It detects Vite on its own (build `npm run build`, output `dist`).
Point alfiemax.com at the Vercel project. Every push to the main branch deploys.

After the domain is live:
1. Submit `https://alfiemax.com/sitemap.xml` in Google Search Console and in Bing Webmaster Tools.
2. Paste the URL into the LinkedIn Post Inspector (linkedin.com/post-inspector) so the share image refreshes.

## 4. What is where

| File | What it does |
|---|---|
| `src/content.js` | Every word on the page, the projects, the experience, the FAQ. |
| `src/seo.js` | Google and AI answer setup: title, description, schema, sitemap, robots.txt, llms.txt. Built from `content.js`. |
| `src/orb.js` | The 10,000 dots: dust, bomb, portrait, dust again. |
| `src/main.js` | All motion: intro, scroll burst, work gallery, cursor, text effects. |
| `src/code.js` | The code that scrolls in the hero after the burst. |
| `src/style.css` | Colours, fonts, layout. The palette is at the top. |
| `public/portrait.bin` | The dot positions for your portrait, made from your LinkedIn photo. |
| `public/og-image.jpg` | The image people see when the link is shared. |

## 5. Swapping the dot portrait for a better photo

A sharp, front-facing photo against a plain wall works best: shoulders up, one soft light from the side.
The dots are made by cutting you out of the photo and sampling 10,000 points from it. Ask whoever built the site
to regenerate `public/portrait.bin` and `public/og-image.jpg` from the new photo. It takes a few minutes.

`?face=night` on the URL previews the dots from the night laptop photo instead.

## 6. Fonts

- Hanken Grotesk for everything, and Mrs Saint Delafield for the signature. Both are free for commercial use (OFL licence).
- Argine is ready to switch on if you buy its commercial licence. See the comment at the top of `src/style.css`.

## 7. If something looks wrong

- People with "reduce motion" on in their phone settings get a still version with no dots and no burst. That's on purpose.
- Browsers with no graphics support show your cut-out photo instead of the dots.
- The intro plays fast (half a second), and any scroll or tap skips it.
