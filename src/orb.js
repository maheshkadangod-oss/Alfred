// The particle system behind the whole site. 10,000 points (5,000 on phones), one WebGL draw call.
//
// Every point has four places it can be, and the page blends between them:
//   field     dust spread over the whole screen
//   ball      a dense "bomb" on the left
//   portrait  Alfred, drawn in dots on the right (positions from public/portrait.bin,
//             sampled from his photo with the background cut out)
//   field     again, after the scroll burst, drifting behind the rest of the site
//
// Load:   dust gathers into the bomb, it heats up, blows, and the pieces land as his portrait.
// Scroll: the portrait trembles, bursts, and settles into dust that follows the scroll.
// Everything is a pure function of the numbers below, so scrolling back rebuilds the portrait.

const VERT = `
attribute vec3 aHome;
attribute vec3 aDir;
attribute vec3 aField;
attribute vec3 aFace;
attribute vec4 aSeed;
uniform float uTime, uIntro, uHeat, uForm, uCharge, uBurst, uPx, uAspect, uDrift, uBallScale, uFaceScale;
uniform vec2 uMouse, uBall, uFace, uPointer;
varying float vAlpha;
varying vec3 vColor;

mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0.,-s, 0.,1.,0., s,0.,c); }
mat3 rotX(float a){ float c=cos(a), s=sin(a); return mat3(1.,0.,0., 0.,c,s, 0.,-s,c); }
float ease(float t){ return t < 0.5 ? 4.0*t*t*t : 1.0 - pow(-2.0*t + 2.0, 3.0) / 2.0; }

void main(){
  float speed = aSeed.x, size = aSeed.y, phase = aSeed.z, kind = aSeed.w;
  float lum = aFace.z;

  // ---- dust field, screen space, wraps top to bottom ----
  float depth = aField.z;
  float fy = mod(aField.y + uDrift * (0.35 + depth * 0.9) + 1.15, 2.3) - 1.15;
  vec2 field = vec2(aField.x + 0.025 * sin(uTime * 0.25 + phase * 6.2831) + uMouse.x * 0.02 * depth, fy);

  // ---- the bomb ----
  vec3 b = aHome;
  b *= (1.0 + 0.03 * sin(uTime * 1.4 + phase * 6.2831)) * (1.0 - 0.25 * uHeat);
  b += 0.03 * uHeat * uHeat * vec3(sin(uTime*47.0 + phase*91.0), cos(uTime*43.0 + speed*77.0), sin(uTime*39.0 + size*63.0));
  b = rotX(0.25) * rotY(uTime * 0.12) * b;
  float bw = 6.0 - b.z;
  vec2 ball = vec2(b.x * 2.1 / (uAspect * bw), b.y * 2.1 / bw) * uBallScale + uBall;

  // ---- the portrait ----
  vec2 f = aFace.xy;
  f += 0.004 * vec2(sin(uTime * 1.3 + phase * 30.0), cos(uTime * 1.1 + speed * 30.0));
  f.x += uMouse.x * 0.03 * (lum - 0.4);
  f.y -= uMouse.y * 0.02 * (lum - 0.4);
  f += 0.02 * uCharge * uCharge * vec2(sin(uTime*45.0 + phase*80.0), cos(uTime*41.0 + speed*70.0));
  vec2 face = vec2(f.x * uFaceScale / uAspect, f.y * uFaceScale) + uFace;

  // ---- blend: dust -> bomb -> portrait -> dust ----
  float iT = ease(clamp(uIntro * 1.15 - speed * 0.15, 0.0, 1.0));
  vec2 pos = mix(field, ball, iT);
  float fT = clamp(uForm * 1.25 - speed * 0.25, 0.0, 1.0);
  vec2 blast = aDir.xy * sin(3.14159 * fT) * (0.25 + speed * speed * 1.1);
  pos = mix(pos, face, ease(fT)) + blast * vec2(1.0 / uAspect, 1.0);
  float sT = smoothstep(0.15 + speed * 0.3, 0.95, uBurst);
  vec2 blast2 = aDir.xy * sin(3.14159 * sT) * (0.2 + speed * speed * 1.4);
  pos = mix(pos, field, sT) + blast2 * vec2(1.0 / uAspect, 1.0);

  // one in five points never leaves the dust field
  float stay = step(fract(phase * 7.31), 0.2);
  pos = mix(pos, field, stay);
  iT *= 1.0 - stay; fT *= 1.0 - stay; sT = max(sT, stay);
  // how "dust-like" this point is right now
  float dust = max(1.0 - iT, sT);

  // the cursor pushes dust aside
  vec2 dd = pos - uPointer; dd.x *= uAspect;
  pos += normalize(dd + 1e-5) * smoothstep(0.24, 0.0, length(dd)) * 0.07 * dust * vec2(1.0 / uAspect, 1.0);
  gl_Position = vec4(pos, 0.0, 1.0);

  // ---- size ----
  float heat = uHeat * (1.0 - fT);
  float ballSize = (1.0 + size * 2.4) * (1.0 + heat * 0.9) * (6.0 / bw) * uBallScale;
  float faceSize = (1.1 + size * 1.4 + lum * 1.2) * (0.75 + uFaceScale * 0.35);
  float dustSize = (0.7 + size * 2.0) * (0.55 + depth * 0.9);
  float s = mix(dustSize, ballSize, iT);
  s = mix(s, faceSize, fT);
  gl_PointSize = mix(s, dustSize, sT) * uPx;

  // ---- colour: metallic greys from the Spiralvue palette, moss green accents ----
  vec3 metal = vec3(0.585, 0.585, 0.585);
  vec3 white = vec3(0.98, 0.99, 0.98);
  vec3 moss = vec3(0.46, 0.56, 0.42);
  vec3 c = mix(metal, white, size);
  c = mix(c, white, heat * 0.9);
  vec3 fc = mix(metal * 0.8, white, lum);
  c = mix(c, fc, fT * (1.0 - sT));
  if (kind > 0.955) c = mix(c, moss * 1.25, max(dust, 0.4));
  vColor = c;

  // ---- alpha ----
  float twinkle = 0.7 + 0.3 * sin(uTime * (1.0 + speed * 2.0) + phase * 40.0);
  float dustA = (0.3 + 0.7 * size) * (0.4 + depth * 0.6) * twinkle;
  float ballA = (0.5 + 0.8 * size) * (1.0 + heat * 0.6);
  float faceA = 0.3 + lum * 1.1;
  float a = mix(dustA, ballA, iT);
  a = mix(a, faceA, fT);
  vAlpha = mix(a, dustA, sT);
}`

const FRAG = `
precision mediump float;
varying float vAlpha;
varying vec3 vColor;
void main(){
  vec2 d = gl_PointCoord - 0.5;
  float r = length(d);
  float a = smoothstep(0.5, 0.0, r);
  a = a * a + smoothstep(0.12, 0.0, r) * 0.6;
  gl_FragColor = vec4(vColor * a * vAlpha, a * vAlpha);
}`

function shader(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s))
  return s
}

export async function createOrb(canvas, { count = 10000, faceUrl = '/portrait.bin' } = {}) {
  let gl
  try { gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' }) } catch { return null }
  if (!gl) return null

  // portrait points: uint16 x, y, brightness per point (see README)
  let faceRaw = null
  try {
    const r = await fetch(faceUrl)
    if (r.ok) faceRaw = new Uint16Array(await r.arrayBuffer())
  } catch {}

  const prog = gl.createProgram()
  gl.attachShader(prog, shader(gl, gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, shader(gl, gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(prog)
  gl.useProgram(prog)

  const home = new Float32Array(count * 3)
  const dir = new Float32Array(count * 3)
  const field = new Float32Array(count * 3)
  const face = new Float32Array(count * 3)
  const seed = new Float32Array(count * 4)
  const facePts = faceRaw ? faceRaw.length / 3 : 0
  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 - 1
    const t = Math.random() * Math.PI * 2
    const s = Math.sqrt(1 - u * u)
    const nx = s * Math.cos(t), ny = u, nz = s * Math.sin(t)
    const r = 1.15 * Math.pow(Math.random(), 0.28)
    home.set([nx * r, ny * r, nz * r], i * 3)
    const jx = nx + (Math.random() - 0.5) * 0.9, jy = ny + (Math.random() - 0.5) * 0.9, jz = nz + (Math.random() - 0.5) * 0.9
    const jl = Math.hypot(jx, jy, jz) || 1
    dir.set([jx / jl, jy / jl, jz / jl], i * 3)
    field.set([(Math.random() * 2 - 1) * 1.08, (Math.random() * 2 - 1) * 1.15, Math.pow(Math.random(), 1.6)], i * 3)
    if (facePts) {
      const k = (i % facePts) * 3
      face.set([faceRaw[k] / 65535 * 2 - 1, faceRaw[k + 1] / 65535 * 2 - 1, faceRaw[k + 2] / 65535], i * 3)
    } else {
      // no portrait file: fall back to a second, larger ring
      face.set([nx * 0.6, ny * 0.6, 0.6], i * 3)
    }
    seed.set([Math.random(), Math.pow(Math.random(), 2.2), Math.random(), Math.random()], i * 4)
  }
  const attr = (name, data, size) => {
    const b = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, b)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, name)
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0)
  }
  attr('aHome', home, 3)
  attr('aDir', dir, 3)
  attr('aField', field, 3)
  attr('aFace', face, 3)
  attr('aSeed', seed, 4)

  const U = {}
  for (const n of ['uTime', 'uIntro', 'uHeat', 'uForm', 'uCharge', 'uBurst', 'uPx', 'uAspect', 'uDrift', 'uBallScale', 'uFaceScale', 'uMouse', 'uBall', 'uFace', 'uPointer']) U[n] = gl.getUniformLocation(prog, n)

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE)
  gl.clearColor(0, 0, 0, 0)

  // st.intro / heat / form are tweened by main.js on load, charge / burst by scroll
  const st = { intro: 0, heat: 0, form: 0, charge: 0, burst: 0, vel: 0, drift: 0, mx: 0, my: 0, tx: 0, ty: 0, px: 9, py: 9, ppx: 9, ppy: 9 }
  let w = 0, h = 0, dpr = 1, raf = 0, last = performance.now()
  const start = last

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = window.innerWidth
    h = window.innerHeight
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    gl.viewport(0, 0, canvas.width, canvas.height)
  }

  function frame(now) {
    raf = requestAnimationFrame(frame)
    if (document.hidden) return
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    st.mx += (st.tx - st.mx) * 0.05
    st.my += (st.ty - st.my) * 0.05
    st.ppx += (st.px - st.ppx) * 0.12
    st.ppy += (st.py - st.ppy) * 0.12
    st.drift += dt * 0.012 + st.vel * 0.0009
    st.vel *= 0.9
    const desk = w > 960
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.uniform1f(U.uTime, (now - start) / 1000)
    gl.uniform1f(U.uIntro, st.intro)
    gl.uniform1f(U.uHeat, st.heat)
    gl.uniform1f(U.uForm, st.form)
    gl.uniform1f(U.uCharge, st.charge)
    gl.uniform1f(U.uBurst, st.burst)
    gl.uniform1f(U.uPx, dpr)
    gl.uniform1f(U.uAspect, w / h)
    gl.uniform1f(U.uDrift, st.drift)
    gl.uniform2f(U.uMouse, st.mx, st.my)
    gl.uniform2f(U.uPointer, st.ppx, st.ppy)
    // bomb on the left, portrait on the right; on phones the portrait fills the top half
    gl.uniform1f(U.uBallScale, desk ? 0.8 : 0.5)
    gl.uniform2f(U.uBall, desk ? -0.52 : -0.55, desk ? 0.18 : 0.62)
    const li = !faceUrl.includes('night')
    gl.uniform1f(U.uFaceScale, desk ? (li ? 0.98 : 0.86) : (li ? 0.42 : 0.48))
    gl.uniform2f(U.uFace, desk ? (li ? 0.5 : 0.22) : (li ? 0.0 : -0.12), desk ? (li ? 0.0 : 0.04) : (li ? 0.47 : 0.42))
    gl.drawArrays(gl.POINTS, 0, count)
  }

  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('pointermove', (e) => {
    st.tx = (e.clientX / window.innerWidth) * 2 - 1
    st.ty = (e.clientY / window.innerHeight) * 2 - 1
    st.px = st.tx
    st.py = -st.ty
  })
  raf = requestAnimationFrame(frame)

  return {
    state: st,
    velocity(v) { st.vel = v },
    destroy() { cancelAnimationFrame(raf) },
  }
}
