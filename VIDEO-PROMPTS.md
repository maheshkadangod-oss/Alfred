# Hero video for alfiemax.com

The hero works like this: a ball of 10,000 light particles sits next to Alfred's name. Scroll, it tightens,
flashes and bursts. When the dust clears, Alfred is standing there in a portrait card with the line
"Complex systems. Kept simple."

That portrait card plays `public/video/hero.mp4` if the file exists. Until then it shows the still photo.
So the video has one job: **look like the person who was inside the bomb.**

## What I need from you first

1. A sharper photo of Alfred. The night laptop photo you sent is 591 x 1280 and has an
   "AI-generated content" tag in the corner (I cropped it out). Ask him for the original from his phone.
2. Alfred's OK to make an AI video of his face. Ask him, don't assume.
3. One photo against a plain dark wall, if he can take one. That unlocks prompt C.

## Settings for every prompt

The site is grey with one red accent, so every clip should come out close to black and white.
The page also greys the video down, so a little colour is fine.


- Tool: Veo 3 in Google AI Studio (or Kling 2.x / Runway Gen-4). Use **image to video** with the photo as the first frame.
- Aspect ratio 9:16. Length 6 to 8 seconds. Sound off.
- Paste the negative prompt below into the negative field if the tool has one.

**Negative prompt:** text, captions, logos, watermark, subtitles, extra fingers, warped hands, face morphing, changing identity, flicker, fast camera moves, zoom blur, cartoon, plastic skin, oversharpened, lens flare, people in background

## Prompt A: the night desk (use this first)

Start frame: the night laptop photo.

```
Cinematic portrait video. A South Indian software engineer in a plain black t-shirt sits at a laptop
by a tall glass window at night, city lights soft and out of focus behind him. He types for a moment,
then looks up into the lens with a calm, confident half smile and holds eye contact. Keyboard backlight
glows softly on his hands. The camera is locked off with a very slow push in, almost still. Muted, almost black and white
colour grade, soft grey tones, a small warm light on his face. Shallow depth of field, 50mm lens,
natural skin texture, quiet and premium mood. Same person, same clothes, same face for the whole clip.
The last frame should match the first frame closely so the clip can loop.
```

## Prompt B: assembled from light (matches the burst best)

Start frame: same photo. If your tool has "end frame", put the photo there instead and leave the start empty.

```
Thousands of tiny silver and white light particles drift in from the darkness and gather into the
shape of a man sitting at a laptop by a night window. The particles settle and become a real, sharp,
photographic person: a South Indian engineer in a black t-shirt, who then looks up at the camera with a
calm half smile. Deep black background at the start, the window and city lights fade in softly behind
him as he forms. Slow, elegant motion, no camera shake. Premium, minimal, cinematic. Same face the whole time.
```

If the face comes out wrong in B, stop. Use A. A wrong face on someone's own portfolio is worse than no video.

## Prompt C: studio cut-out (needs the plain-wall photo)

```
Studio portrait video on a pure graphite grey background (#141414). A South Indian software engineer
in a black t-shirt stands with arms crossed, lit by one soft key light from the left and a thin neutral
white rim light from behind. He uncrosses his arms, turns his head slowly to the camera and gives a small
nod. Camera fixed at chest height, 85mm lens, very slow push in. No props, no text. Desaturated grey colour grade. Calm and confident.
```

C is the one that looks like the "SATHYADEV" reference you sent, where the person stands in front of the name.

## After you get the video

Paste this into Claude Code from the project folder. It shrinks the file so the page stays fast:

```bash
ffmpeg -i your-video.mp4 -vf "scale=720:-2,fps=30" -c:v libx264 -crf 26 -preset slow -an -movflags +faststart public/video/hero.mp4
```

Aim for under 4 MB. Then also save one still from the clip as `public/img/alfred-night.webp`
so the poster frame matches the video's first frame.
