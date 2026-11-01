# alfiemax.com

Portfolio for Alfred Dominic, Solutions Architect and Full-Stack Engineer, Kochi.
Vite, GSAP, Lenis, and raw WebGL for the hero. Graphite grey with one red accent, Hanken Grotesk throughout. Same setup as the Evan Lee site.

## Edit the words
All copy lives in `src/content.js`. Lines marked `CONFIRM` disagree between the live site and LinkedIn,
or need Alfred's sign-off before launch.

## How it is built
- `src/render.js` turns content into HTML. `vite.config.js` runs it at build time so crawlers read the
  real numbers. (The old site showed "0+ Years" to Google because the counters started at zero.)
- `src/orb.js` is the hero bomb: 10,000 particles on desktop, 5,000 on phones, one WebGL draw call.
- `src/main.js` ties the burst to scroll. Scroll back up and the bomb pulls itself together again.
- People who turn off motion in their phone settings get a still hero with no burst.

## Hero video
See `VIDEO-PROMPTS.md`. Drop the result at `public/video/hero.mp4`. Until it exists, the photo shows.

## Run locally
```
npm install
npm run dev
```

## Deploy
Import this repo in Vercel. It detects Vite (build `npm run build`, output `dist`).
