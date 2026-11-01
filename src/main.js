import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { createOrb } from './orb.js'
import { hero } from './content.js'

// Page HTML is pre-rendered at build time (src/render.js). This file only adds motion.
gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })
const crawler = /bot|crawl|spider|slurp|lighthouse|preview/i.test(navigator.userAgent)
const reduced = crawler || window.matchMedia('(prefers-reduced-motion: reduce)').matches
const phone = window.matchMedia('(max-width: 700px)').matches
const desk = window.matchMedia('(min-width: 961px)')
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => [...r.querySelectorAll(s)]
const splitChars = (el, text = el.textContent) => {
  el.innerHTML = [...text].map((c, i) => `<span class="ch" style="--i:${i}">${c === ' ' ? '&nbsp;' : c}</span>`).join('')
  return $$('.ch', el)
}

// ---------- smooth scroll ----------
const lenis = new Lenis({ lerp: 0.09, smoothWheel: !reduced })
gsap.ticker.add((t) => lenis.raf(t * 1000))
gsap.ticker.lagSmoothing(0)
$$('a[href^="#"]').forEach((a) =>
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href')
    if (id.length < 2) return
    e.preventDefault()
    lenis.scrollTo(id === '#top' ? 0 : id, { offset: id === '#work' ? 0 : -70, duration: 1.6, immediate: reduced })
  })
)
const nav = $('.nav')
ScrollTrigger.create({ start: 80, end: 'max', onToggle: (st) => nav.classList.toggle('solid', st.isActive) })

// nav links: letters roll up on hover
$$('.nav-links a').forEach((a) => { const s = document.createElement('span'); s.className = 'roll'; a.textContent && (splitChars(s, a.textContent), a.replaceChildren(s)) })

// ---------- particles ----------
// P is what the timelines animate; it is copied into the GPU state every frame.
const P = { intro: 0, heat: 0, form: 0, charge: 0, burst: 0 }
let orb = null
if (!reduced) {
  // ?face=li previews the LinkedIn headshot as the dot portrait
  const faceUrl = new URLSearchParams(location.search).get('face') === 'li' ? '/portrait-li.bin' : '/portrait.bin'
  createOrb($('.orb'), { count: phone ? 5000 : 10000, faceUrl }).then((o) => {
    orb = o
    if (!orb) document.body.classList.add('no-orb')
  }).catch(() => document.body.classList.add('no-orb'))
  gsap.ticker.add(() => { if (orb) Object.assign(orb.state, P) })
}
lenis.on('scroll', (e) => {
  ScrollTrigger.update()
  if (orb) orb.velocity(e.velocity)
})

// ---------- the big chrome word ----------
const word = $('.word')
const wordChars = splitChars(word, hero.word)
// slow shine across the letters
if (!reduced) gsap.fromTo(word, { '--shine': '160%' }, { '--shine': '-60%', duration: 2.6, ease: 'power2.inOut', repeat: -1, repeatDelay: 2.4 })

if (reduced) {
  document.body.classList.add('still', 'no-orb')
} else {
  intro()
}

// ---------- intro: a dot in a spotlight becomes the name, the bomb forms, blows, and lands as Alfred ----------
function intro() {
  document.body.classList.add('loading')
  lenis.stop()
  const loader = $('.loader')
  const dot = $('.l-dot')
  const sign = $('.l-sign')
  gsap.set(['.nav', '.hero-a', '.hero-meta', '.hero-sig'], { autoAlpha: 0 })
  gsap.set(wordChars, { autoAlpha: 0 })

  const tl = gsap.timeline({ delay: 0.2 })
  tl.fromTo(dot, { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' })
    .to(dot, { scale: 1.6, duration: 0.25, yoyo: true, repeat: 1, ease: 'sine.inOut' })
  // the dust starts gathering into the bomb behind the loader
  tl.to(P, { intro: 1, duration: 2.4, ease: 'power2.inOut' }, 0.3)

  // the dot becomes the pen: it runs left to right and his signature appears behind it
  tl.call(() => {
    const r = sign.getBoundingClientRect()
    gsap.set(dot, { x: r.left - window.innerWidth / 2, y: r.top + r.height * 0.62 - window.innerHeight / 2, scale: 0.6 })
  })
  tl.set(sign, { autoAlpha: 1 })
  tl.fromTo(sign, { clipPath: 'inset(-20% 100% -20% 0)' }, { clipPath: 'inset(-20% 0% -20% 0)', duration: 1.6, ease: 'power1.inOut' })
  tl.to(dot, { x: () => { const r = sign.getBoundingClientRect(); return r.right - window.innerWidth / 2 }, duration: 1.6, ease: 'power1.inOut' }, '<')
  tl.to(dot, { y: '+=10', duration: 0.2, yoyo: true, repeat: 7, ease: 'sine.inOut' }, '<')
  tl.to(dot, { scale: 0, duration: 0.3 })
  tl.to(sign, { autoAlpha: 0, y: -20, filter: 'blur(8px)', duration: 0.6, ease: 'power2.in' }, '+=0.3')

  // the spotlight opens, the bomb heats up and blows, the pieces land as the portrait
  tl.call(() => loader.classList.add('done'))
  tl.to(P, { heat: 1, duration: 0.7, ease: 'power2.in' }, '<')
  tl.fromTo('.flash', { autoAlpha: 0 }, { autoAlpha: 0.7, duration: 0.08 }, '>-0.05')
  tl.to('.flash', { autoAlpha: 0, duration: 0.8, ease: 'power2.out' })
  tl.to(P, { form: 1, duration: 1.8, ease: 'power2.out' }, '<-0.75')
  // the big word rises letter by letter, like it is standing up
  tl.fromTo(wordChars, { yPercent: 105, rotateX: -85, autoAlpha: 0 }, { yPercent: 0, rotateX: 0, autoAlpha: 1, duration: 1.3, ease: 'expo.out', stagger: 0.05 }, '<0.2')
  tl.fromTo(['.nav', '.hero-a', '.hero-meta'], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.1 }, '<0.5')
  tl.fromTo('.hero-sig', { autoAlpha: 1, clipPath: 'inset(-30% 100% -30% 0)' }, { clipPath: 'inset(-30% 0% -30% 0)', duration: 1.4, ease: 'power1.inOut' }, '<0.3')
  tl.call(() => {
    loader.remove()
    document.body.classList.remove('loading')
    lenis.start()
    heroScroll()
    wordHover()
  })
  // any key or click skips straight to the end
  const skip = () => tl.progress() < 0.98 && tl.timeScale(5)
  window.addEventListener('keydown', skip, { once: true })
  window.addEventListener('pointerdown', skip, { once: true })
}

// ---------- scroll: the portrait trembles, bursts, and turns into the dust behind the site ----------
function heroScroll() {
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.hero', start: 'top top', end: phone ? '+=120%' : '+=160%', pin: '.hero-stage', scrub: 0.9 },
  })
  tl.to(P, { charge: 1, duration: 0.2, ease: 'power2.in' }, 0)
  tl.to('.hero-a', { autoAlpha: 0, y: -30, filter: 'blur(6px)', duration: 0.15 }, 0.02)
  // the letters get thrown apart by the blast
  wordChars.forEach((c, i) => {
    const side = (i - (wordChars.length - 1) / 2) / wordChars.length
    tl.to(c, { yPercent: -60 - Math.random() * 120, xPercent: side * 160, rotate: side * 70 + (Math.random() - 0.5) * 40, autoAlpha: 0, filter: 'blur(10px)', duration: 0.35, ease: 'power2.out' }, 0.2 + Math.random() * 0.04)
  })
  tl.to(['.hero-meta', '.hero-sig'], { autoAlpha: 0, duration: 0.1 }, 0.18)
  tl.fromTo('.flash', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.025 }, 0.195)
  tl.to('.flash', { autoAlpha: 0, duration: 0.12, ease: 'power2.out' }, 0.22)
  tl.fromTo('.shock', { scale: 0.3, autoAlpha: 0 }, { scale: 5, autoAlpha: 0.9, duration: 0.05 }, 0.2)
  tl.to('.shock', { scale: 10, autoAlpha: 0, duration: 0.2, ease: 'power2.out' }, 0.25)
  tl.to(P, { charge: 0, duration: 0.1 }, 0.25)
  tl.to(P, { burst: 1, duration: 0.6, ease: 'power1.out' }, 0.2)
  tl.fromTo('.after span', { autoAlpha: 0, yPercent: 60, filter: 'blur(8px)' }, { autoAlpha: 1, yPercent: 0, filter: 'blur(0px)', stagger: 0.06, duration: 0.25, ease: 'power3.out' }, 0.48)
  tl.fromTo('.after-sub', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 0.6)
  tl.to({}, { duration: 0.12 })
}

// letters lift and thicken as the cursor passes over them
function wordHover() {
  if (!finePointer) return
  const setters = wordChars.map((c) => ({ y: gsap.quickTo(c, 'yPercent', { duration: 0.6, ease: 'power3' }), s: gsap.quickTo(c, 'scaleY', { duration: 0.6, ease: 'power3' }), c }))
  const stage = $('.hero-stage')
  stage.addEventListener('pointermove', (e) => {
    if (P.burst > 0.05) return
    setters.forEach(({ y, s, c }) => {
      const r = c.getBoundingClientRect()
      const d = Math.abs(e.clientX - (r.left + r.width / 2)) / window.innerWidth
      const near = e.clientY > r.top - 200 ? Math.max(0, 1 - d * 6) : 0
      y(-near * 10)
      s(1 + near * 0.08)
      c.style.fontWeight = String(Math.round(700 + near * 200))
    })
  })
  stage.addEventListener('pointerleave', () => setters.forEach(({ y, s, c }) => { y(0); s(1); c.style.fontWeight = '' }))
}

if (!reduced) {
  // ---------- custom cursor ----------
  if (finePointer) {
    document.body.classList.add('has-cursor')
    const cur = $('.cursor')
    const dx = gsap.quickTo('.c-dot', 'x', { duration: 0.08 }), dy = gsap.quickTo('.c-dot', 'y', { duration: 0.08 })
    const rx = gsap.quickTo('.c-ring', 'x', { duration: 0.45, ease: 'power3' }), ry = gsap.quickTo('.c-ring', 'y', { duration: 0.45, ease: 'power3' })
    window.addEventListener('pointermove', (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY) })
    const label = $('.c-ring span')
    document.addEventListener('pointerover', (e) => {
      const card = e.target.closest('.project')
      const link = e.target.closest('a, button')
      cur.classList.toggle('view', !!card && desk.matches)
      cur.classList.toggle('link', !!link && !card)
      label.textContent = card ? 'Scroll' : ''
    })
  }

  // ---------- magnetic buttons ----------
  if (finePointer) $$('.magnetic').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' }), y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * 0.35); y((e.clientY - r.top - r.height / 2) * 0.35) })
    el.addEventListener('pointerleave', () => { x(0); y(0) })
  })

  // ---------- headings: words flip up into place ----------
  $$('.split').forEach((h) =>
    gsap.from(h.querySelectorAll('.w > span'), { yPercent: 110, rotate: 4, duration: 1.1, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: h, start: 'top 85%' } })
  )
  $$('.reveal').forEach((el) =>
    gsap.from(el, { autoAlpha: 0, y: 40, filter: 'blur(6px)', duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } })
  )

  // ---------- numbers count up (the real numbers are already in the HTML for crawlers) ----------
  $$('[data-count]').forEach((el) => {
    const m = el.dataset.count.match(/^(\d+)(.*)$/)
    if (!m) return
    const o = { v: 0 }
    gsap.to(o, { v: +m[1], duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' }, onUpdate: () => { el.textContent = Math.round(o.v) + m[2] } })
  })

  // ---------- work ----------
  const cards = $$('.project')
  const drawCard = (card) => {
    if (card.dataset.drawn) return
    card.dataset.drawn = 1
    const wires = $$('.wire', card)
    wires.forEach((w) => { const l = w.getTotalLength(); w.style.strokeDasharray = l; w.style.strokeDashoffset = l })
    gsap.timeline()
      .to(wires, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut', stagger: 0.12 })
      .from($$('.node', card), { scale: 0, transformOrigin: '50% 50%', autoAlpha: 0, duration: 0.6, ease: 'back.out(2)', stagger: 0.07 }, 0.1)
  }
  cards.forEach((card) => card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect()
    card.style.setProperty('--mx', `${e.clientX - r.left}px`)
    card.style.setProperty('--my', `${e.clientY - r.top}px`)
  }))

  const mm = gsap.matchMedia()
  mm.add('(min-width: 961px)', () => {
    const track = $('.work-track')
    const dist = () => track.scrollWidth - window.innerWidth
    const now = $('.wc-now'), bar = $('.wc-bar i')
    const inners = cards.map((c) => $('.p-inner', c))
    const proxy = { skew: 0 }
    const skewSet = gsap.quickSetter(inners, 'skewX', 'deg')
    const clamp = gsap.utils.clamp(-7, 7)
    const tween = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: '.work-pin', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true,
        onUpdate: (st) => {
          const i = Math.min(cards.length - 1, Math.round(st.progress * (cards.length - 1)))
          now.textContent = String(i + 1).padStart(2, '0')
          bar.style.transform = `scaleX(${0.1 + st.progress * 0.9})`
          const skew = clamp(st.getVelocity() / -400)
          if (Math.abs(skew) > Math.abs(proxy.skew)) {
            proxy.skew = skew
            gsap.to(proxy, { skew: 0, duration: 0.9, ease: 'power3', overwrite: true, onUpdate: () => skewSet(proxy.skew) })
          }
          // cards near the middle of the screen sit up; the rest lean back a little
          const mid = window.innerWidth / 2
          inners.forEach((el) => {
            const r = el.getBoundingClientRect()
            const d = Math.min(1, Math.abs(r.left + r.width / 2 - mid) / mid)
            el.style.transform = `skewX(${proxy.skew}deg) scale(${1 - d * 0.07}) rotateY(${(r.left + r.width / 2 > mid ? -1 : 1) * d * 8}deg)`
            el.style.opacity = String(1 - d * 0.25)
          })
        },
      },
    })
    cards.forEach((card) => ScrollTrigger.create({ trigger: card, containerAnimation: tween, start: 'left 85%', onEnter: () => drawCard(card) }))
    $('.work-track').style.perspective = '1400px'
  })
  mm.add('(max-width: 960px)', () => {
    cards.forEach((card) => {
      gsap.from(card, { autoAlpha: 0, y: 60, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 88%' } })
      ScrollTrigger.create({ trigger: card, start: 'top 75%', once: true, onEnter: () => drawCard(card) })
    })
  })

  // ---------- marquee: speeds up and flips direction with the scroll ----------
  const rows = $$('.mq-track').map((t, i) => gsap.to(t, { xPercent: -50, duration: 38 + i * 6, ease: 'none', repeat: -1 }))
  rows[1] && rows[1].progress(0.5).reversed(true)
  let dir = 1
  lenis.on('scroll', (e) => {
    if (e.direction) dir = e.direction
    const boost = 1 + Math.min(Math.abs(e.velocity) / 6, 6)
    rows.forEach((r, i) => gsap.to(r, { timeScale: boost * dir * (i ? -1 : 1), duration: 0.3, overwrite: true }))
  })

  // ---------- experience: the line fills and each job lights up as you reach it ----------
  gsap.to('.tl-fill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 60%', end: 'bottom 60%', scrub: true } })
  $$('.job').forEach((j) => ScrollTrigger.create({ trigger: j, start: 'top 62%', end: 'bottom 62%', onToggle: (st) => st.isActive && j.classList.add('on'), onLeaveBack: () => j.classList.remove('on') }))

  // ---------- contact ----------
  gsap.from('.bl > span', { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.big', start: 'top 85%' } })
  gsap.from('.mail', { autoAlpha: 0, y: 30, duration: 1, scrollTrigger: { trigger: '.mail', start: 'top 92%' } })
  gsap.fromTo('.contact-sig', { clipPath: 'inset(-30% 100% -30% 0)' }, { clipPath: 'inset(-30% 0% -30% 0)', duration: 1.6, ease: 'power1.inOut', scrollTrigger: { trigger: '.contact-sig', start: 'top 95%' } })
} else {
  $$('.job').forEach((j) => j.classList.add('on'))
}
