// The hero "bomb": 10,000 glowing particles packed into a dense, breathing sphere.
// Scroll drives two values:
//   charge 0..1  the sphere tightens, shakes and heats up (blue to white)
//   burst  0..1  every particle flies out on its own path, sparks fade, the stage clears
// Both are pure functions of scroll, so scrolling back up pulls the bomb back together.
// Raw WebGL, one draw call, all motion on the GPU. No three.js needed.

const VERT = `
attribute vec3 aHome;
attribute vec3 aDir;
attribute vec4 aSeed;
uniform float uTime, uCharge, uBurst, uPx, uAspect, uScale;
uniform vec2 uMouse, uCenter;
varying float vAlpha;
varying vec3 vColor;

mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0.,-s, 0.,1.,0., s,0.,c); }
mat3 rotX(float a){ float c=cos(a), s=sin(a); return mat3(1.,0.,0., 0.,c,s, 0.,-s,c); }

void main(){
  float speed = aSeed.x, size = aSeed.y, phase = aSeed.z, kind = aSeed.w;
  vec3 p = aHome;

  // idle: slow breathing, each particle a little out of step
  p *= 1.0 + 0.03 * sin(uTime * 1.4 + phase * 6.2831);
  // charge: squeeze inward and tremble
  p *= 1.0 - 0.22 * uCharge;
  float shake = 0.035 * uCharge * uCharge * (1.0 - uBurst);
  p += shake * vec3(sin(uTime*47.0 + phase*91.0), cos(uTime*43.0 + speed*77.0), sin(uTime*39.0 + size*63.0));

  // burst: fast at first, then drifting, with a slight fall for the heavier sparks
  float e = 1.0 - pow(1.0 - uBurst, 4.0);
  p += aDir * e * (1.6 + speed * speed * 9.0);
  p.y -= uBurst * uBurst * (0.4 + kind) * 1.4;

  p = rotX(0.25 + uMouse.y * 0.25) * rotY(uTime * 0.09 + uMouse.x * 0.45) * p;

  // simple perspective camera at z = 6
  float z = p.z - 6.0;
  float f = 2.1;
  gl_Position = vec4(p.x * f / uAspect * uScale + uCenter.x * -z, p.y * f * uScale + uCenter.y * -z, 0.0, -z);

  float heat = clamp(uCharge * 1.2 - uBurst * 0.8, 0.0, 1.0);
  gl_PointSize = (1.0 + size * 2.4) * uPx * (1.0 + heat * 0.9 + uBurst * 0.6) * (6.0 / -z) * uScale;

  vec3 ice = vec3(0.86, 0.85, 0.83);
  vec3 deep = vec3(0.42, 0.41, 0.40);
  vec3 hot = vec3(1.0, 1.0, 0.98);
  vec3 ember = vec3(0.9, 0.25, 0.18);
  vec3 c = mix(deep, ice, size);
  c = mix(c, hot, heat * 0.85);
  if (kind > 0.94) c = mix(c, ember, smoothstep(0.02, 0.2, uBurst));   // one in twenty becomes a spark
  vColor = c;

  float fade = 1.0 - smoothstep(0.35 + speed * 0.4, 1.0, uBurst);
  vAlpha = (0.5 + 0.8 * size) * fade * (1.0 + heat * 0.6);
}`

const FRAG = `
precision mediump float;
varying float vAlpha;
varying vec3 vColor;
void main(){
  vec2 d = gl_PointCoord - 0.5;
  float r = length(d);
  float a = smoothstep(0.5, 0.0, r);
  a = a * a + smoothstep(0.12, 0.0, r) * 0.6;   // soft halo plus a bright core
  gl_FragColor = vec4(vColor * a * vAlpha, a * vAlpha);
}`

function shader(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s))
  return s
}

export function createOrb(canvas, { count = 10000 } = {}) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' })
  if (!gl) return null

  const prog = gl.createProgram()
  gl.attachShader(prog, shader(gl, gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, shader(gl, gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(prog)
  gl.useProgram(prog)

  // build the particles once
  const home = new Float32Array(count * 3)
  const dir = new Float32Array(count * 3)
  const seed = new Float32Array(count * 4)
  for (let i = 0; i < count; i++) {
    // random point on a sphere
    const u = Math.random() * 2 - 1
    const t = Math.random() * Math.PI * 2
    const s = Math.sqrt(1 - u * u)
    const nx = s * Math.cos(t), ny = u, nz = s * Math.sin(t)
    // most particles sit near the shell, some fill the core, so it reads as solid
    const r = 1.15 * Math.pow(Math.random(), 0.28)
    home.set([nx * r, ny * r, nz * r], i * 3)
    // fly mostly outward, with some scatter so it is not a perfect ball expanding
    const jx = nx + (Math.random() - 0.5) * 0.7, jy = ny + (Math.random() - 0.5) * 0.7, jz = nz + (Math.random() - 0.5) * 0.7
    const jl = Math.hypot(jx, jy, jz) || 1
    dir.set([jx / jl, jy / jl, jz / jl], i * 3)
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
  attr('aSeed', seed, 4)

  const U = {}
  for (const n of ['uTime', 'uCharge', 'uBurst', 'uPx', 'uAspect', 'uScale', 'uMouse', 'uCenter']) U[n] = gl.getUniformLocation(prog, n)

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE) // additive: overlapping particles glow brighter
  gl.clearColor(0, 0, 0, 0)

  const state = { charge: 0, burst: 0, mouseX: 0, mouseY: 0, mx: 0, my: 0 }
  let w = 0, h = 0, dpr = 1, raf = 0, visible = true, start = performance.now()

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = canvas.clientWidth
    h = canvas.clientHeight
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    gl.viewport(0, 0, canvas.width, canvas.height)
  }

  function frame(now) {
    raf = requestAnimationFrame(frame)
    if (!visible) return
    state.mx += (state.mouseX - state.mx) * 0.05
    state.my += (state.mouseY - state.my) * 0.05
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.uniform1f(U.uTime, (now - start) / 1000)
    gl.uniform1f(U.uCharge, state.charge)
    gl.uniform1f(U.uBurst, state.burst)
    gl.uniform1f(U.uPx, dpr)
    gl.uniform1f(U.uAspect, w / h)
    gl.uniform1f(U.uScale, w < 700 ? 0.78 : 1)
    gl.uniform2f(U.uMouse, state.mx, state.my)
    // desktop: bomb sits right of the name (68% across). Phones: centred, upper part of the screen.
    if (w > 960) gl.uniform2f(U.uCenter, 0.36, 0.0)
    else gl.uniform2f(U.uCenter, 0.0, 0.24)
    gl.drawArrays(gl.POINTS, 0, count)
  }

  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('pointermove', (e) => {
    state.mouseX = (e.clientX / window.innerWidth) * 2 - 1
    state.mouseY = (e.clientY / window.innerHeight) * 2 - 1
  })
  // stop drawing when the hero is off screen, to save battery
  new IntersectionObserver(([en]) => { visible = en.isIntersecting }).observe(canvas)
  raf = requestAnimationFrame(frame)

  return {
    set(charge, burst) { state.charge = charge; state.burst = burst },
    destroy() { cancelAnimationFrame(raf) },
  }
}
