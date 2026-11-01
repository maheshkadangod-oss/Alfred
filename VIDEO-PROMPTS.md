# Video prompts for alfiemax.com

The hero no longer needs a video of Alfred. His portrait is drawn live in 10,000 dots, so it can
burst and rebuild. Video is still worth making for two jobs: the dot portrait's source photo, and
the launch reel for Instagram and LinkedIn (the kind of clip you sent me as references).

Settings for all: Veo 3 in Google AI Studio (or Kling / Runway), 9:16, 8 seconds, no sound.
Negative prompt for all: text, captions, logos, watermark, extra fingers, warped hands, face morphing,
changing identity, flicker, cartoon, plastic skin, oversharpened, people in background

## 1. A better source for the dot portrait (do this first)

The dots copy whatever photo they're fed. The night photo cuts his face at the frame edge, so the dots
draw half a face. The best fix is a real photo, not AI: Alfred, shoulders up, facing the camera, plain
dark wall, one soft light from the side. A phone in portrait mode is enough. Send it and I swap it in.

If he wants to try AI first, use the LinkedIn photo as the start frame:

```
Studio headshot video. A South Indian software engineer in a plain grey t-shirt faces the camera,
shoulders square, on a pure dark charcoal background. One soft key light from the left, gentle rim
light on his hair. He holds still, then gives a slow, calm half smile. Camera locked off. Sharp focus
on the eyes, natural skin texture, muted almost black and white colour grade. Same face for the whole clip.
```

Pause on the sharpest frame and screenshot it. That still is what goes into the dot portrait.

## 2. Launch reel: the site on a screen (the style of your reference clips)

Record the real site with a screen recorder first. Then use AI only for the setting shot:

```
Slow cinematic push in on a matte black monitor on a dark walnut desk at night. A small green plant
and a warm desk lamp at the edge of frame, deep green and charcoal tones, soft haze. The screen glows
softly. Camera glides forward smoothly at a slight angle, 35mm lens, shallow depth of field, premium
studio mood, nothing moving except the camera.
```

Then put your screen recording onto the monitor in CapCut (corner pin, or "screen replace").
Caption idea: "11 years of systems, kept simple. alfiemax.com"

## 3. Hook clip for the first second of the reel

```
Macro shot in total darkness. A single point of white light hangs in the middle of the frame, pulses
once, then bursts into thousands of tiny silver particles that drift outward slowly like dust in a
spotlight. Faint green tint at the edges. Smooth slow motion, very premium, no camera shake.
```

This matches the site's own load animation, so the reel and the site feel like one thing.

## Shrink any clip before it goes on the web

```bash
ffmpeg -i in.mp4 -vf "scale=720:-2,fps=30" -c:v libx264 -crf 26 -preset slow -an -movflags +faststart out.mp4
```
