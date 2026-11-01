import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { createOrb } from './orb.js'
import { hero } from './content.js'
import { decode, splitWords } from './text.js'

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
// letters in their own spans, but each word kept together so lines only break between words
const splitWordsToChars = (el) => {
  el.innerHTML = el.textContent.split(' ').map((w) => `<span style="display:inline-block;white-space:nowrap">${[...w].map((c) => `<span class="ch" style="display:inline-block">${c}</span>`).join('')}</span>`).join(' ')
  return $$('.ch', el)
}
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
  // default is the LinkedIn headshot; ?face=night previews the night laptop photo
  const faceUrl = new URLSearchParams(location.search).get('face') === 'night' ? '/portrait-night.bin' : '/portrait.bin'
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
// each letter gets an inner layer: the intro and the cursor move the inner one, the scroll burst moves the outer one,
// so the two never fight over the same element
wordChars.forEach((c) => { c.innerHTML = `<span class="ci">${c.innerHTML}</span>` })
const wordInner = wordChars.map((c) => c.firstChild)
// slow shine across the letters
if (!reduced) {
  gsap.fromTo(word, { '--shine': '160%' }, { '--shine': '-60%', duration: 2.6, ease: 'power2.inOut', repeat: -1, repeatDelay: 2.4 })
  // the pinstripes inside the letters drift down slowly; scrolling makes them run and widen
  gsap.to(word, { '--stripe': '120px', duration: 6, ease: 'none', repeat: -1 })
  lenis.on('scroll', (e) => gsap.to(word, { '--sw': `${4 + Math.min(Math.abs(e.velocity), 20) * 0.5}px`, duration: 0.4, overwrite: 'auto' }))
}

if (reduced) {
  document.body.classList.add('still', 'no-orb')
} else {
  intro()
}

// ---------- intro: a dot in a spotlight becomes the name, the bomb forms, blows, and lands as Alfred ----------
function intro() {
  // The page is on screen and scrollable after 0.5 seconds. The particles keep building the
  // portrait for about a second after that, while people are already reading.
  const loader = $('.loader')
  const dot = $('.l-dot')
  heroScroll()
  gsap.set(wordInner, { autoAlpha: 0 })
  gsap.set(['.nav', '.hero-a > *', '.hero-meta > *'], { autoAlpha: 0 })
  gsap.set('.hero-sig', { autoAlpha: 1, clipPath: 'inset(-30% 100% -30% 0)' })

  const tl = gsap.timeline()
  // 0 to 0.5s: a dot flares in the spotlight, the dust rushes into the bomb, it flashes, the curtain lifts
  tl.fromTo(dot, { scale: 0 }, { scale: 1.8, duration: 0.2, ease: 'back.out(3)' }, 0)
  tl.to(dot, { scale: 0, autoAlpha: 0, duration: 0.15, ease: 'power3.in' }, 0.25)
  tl.to(P, { intro: 1, duration: 0.55, ease: 'power3.out' }, 0.05)
  tl.to(P, { heat: 1, duration: 0.25, ease: 'power2.in' }, 0.3)
  tl.call(() => loader.classList.add('done'), null, 0.15)
  tl.fromTo('.flash', { autoAlpha: 0 }, { autoAlpha: 0.6, duration: 0.06 }, 0.5)
  tl.to('.flash', { autoAlpha: 0, duration: 0.6, ease: 'power2.out' }, 0.56)
  tl.call(() => loader.remove(), null, 0.5)
  // the name and copy arrive inside the same half second
  tl.fromTo(wordInner, { yPercent: 105, rotateX: -85, autoAlpha: 0 }, { yPercent: 0, rotateX: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out', stagger: 0.03 }, 0.15)
  tl.fromTo(['.nav', '.hero-a > *', '.hero-meta > *'], { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.05 }, 0.2)
  // after 0.5s, in the background: the bomb blows and the pieces land as Alfred, the signature writes itself
  tl.to(P, { form: 1, duration: 1.1, ease: 'power2.out' }, 0.5)
  tl.to('.hero-sig', { clipPath: 'inset(-30% 0% -30% 0)', duration: 0.9, ease: 'power1.inOut' }, 0.6)
  tl.call(() => decode($('.eyebrow'), { duration: 0.8 }), null, 0.4)
  tl.call(wordHover, null, 0.9)
}

// ---------- scroll: the portrait trembles, bursts, and turns into the dust behind the site ----------
function heroScroll() {
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.hero', start: 'top top', end: phone ? '+=120%' : '+=160%', pin: '.hero-stage', scrub: 0.9, refreshPriority: 10 },
  })
  tl.to(P, { charge: 1, duration: 0.2, ease: 'power2.in' }, 0)
  tl.fromTo('.hero-a', { autoAlpha: 1, y: 0, filter: 'blur(0px)' }, { autoAlpha: 0, y: -30, filter: 'blur(6px)', duration: 0.15, immediateRender: false }, 0.02)
  // the letters get thrown apart by the blast
  wordChars.forEach((c, i) => {
    const side = (i - (wordChars.length - 1) / 2) / wordChars.length
    tl.fromTo(c, { yPercent: 0, xPercent: 0, rotate: 0, rotateX: 0, autoAlpha: 1, filter: 'blur(0px)' }, { immediateRender: false, yPercent: -60 - Math.random() * 120, xPercent: side * 160, rotate: side * 70 + (Math.random() - 0.5) * 40, autoAlpha: 0, filter: 'blur(10px)', duration: 0.35, ease: 'power2.out' }, 0.2 + Math.random() * 0.04)
  })
  tl.fromTo(['.hero-meta', '.hero-sig', '.hero-rail'], { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.1, immediateRender: false }, 0.18)
  tl.fromTo('.flash', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.025 }, 0.195)
  tl.to('.flash', { autoAlpha: 0, duration: 0.12, ease: 'power2.out' }, 0.22)
  tl.fromTo('.shock', { scale: 0.3, autoAlpha: 0 }, { scale: 5, autoAlpha: 0.9, duration: 0.05 }, 0.2)
  tl.to('.shock', { scale: 10, autoAlpha: 0, duration: 0.2, ease: 'power2.out' }, 0.25)
  tl.to(P, { charge: 0, duration: 0.1 }, 0.25)
  tl.to(P, { burst: 1, duration: 0.6, ease: 'power1.out' }, 0.2)
  tl.fromTo('.after span', { autoAlpha: 0, yPercent: 60, filter: 'blur(8px)' }, { autoAlpha: 1, yPercent: 0, filter: 'blur(0px)', stagger: 0.05, duration: 0.22, ease: 'power3.out' }, 0.3)
  tl.fromTo('.after-sub', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 0.42)
  // real code fills the middle, columns running up and down
  tl.fromTo('.code-rain', { autoAlpha: 0, filter: 'blur(8px)', scale: 0.97 }, { autoAlpha: 1, filter: 'blur(0px)', scale: 1, duration: 0.25, ease: 'power2.out' }, 0.3)
  // the three numbers rise on the right and count up with the scroll
  $$('.after-stats li').forEach((li, i) => {
    const el = $('strong', li)
    const m = el.dataset.to.match(/^(\d+)(.*)$/)
    const o = { v: 0 }
    tl.fromTo(li, { autoAlpha: 0, x: 60, filter: 'blur(10px)' }, { autoAlpha: 1, x: 0, filter: 'blur(0px)', duration: 0.2, ease: 'power3.out' }, 0.34 + i * 0.07)
    if (m) tl.fromTo(o, { v: 0 }, { v: +m[1], duration: 0.3, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v) + m[2] } }, 0.34 + i * 0.07)
  })
  tl.to({}, { duration: 0.12 })
}

// letters lift and thicken as the cursor passes over them
function wordHover() {
  if (!finePointer) return
  const setters = wordInner.map((c) => ({ y: gsap.quickTo(c, 'yPercent', { duration: 0.6, ease: 'power3' }), s: gsap.quickTo(c, 'scaleY', { duration: 0.6, ease: 'power3' }), c }))
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
    gsap.from(el, { clipPath: 'inset(0 0 100% 0)', y: 30, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } })
  )

  // ---------- floating photo ----------
  const fp = $('.fp-card')
  if (fp) {
    gsap.to('.float-photo', { y: -16, rotate: 0.8, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    gsap.to('.fp-chip', { y: 10, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.4 })
    gsap.fromTo('.float-photo', { yPercent: 14 }, { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true } })
    gsap.fromTo(fp, { clipPath: 'inset(100% 0 0 0 round 26px)', scale: 1.08 }, { clipPath: 'inset(0% 0 0 0 round 26px)', scale: 1, duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: '.float-photo', start: 'top 80%' } })
    gsap.fromTo('.fp-tag', { clipPath: 'inset(-30% 100% -30% 0)' }, { clipPath: 'inset(-30% 0% -30% 0)', duration: 1.2, ease: 'power1.inOut', delay: 0.9, scrollTrigger: { trigger: '.float-photo', start: 'top 80%' } })
    if (finePointer) {
      const rx = gsap.quickTo(fp, 'rotateX', { duration: 0.8, ease: 'power3' }), ry = gsap.quickTo(fp, 'rotateY', { duration: 0.8, ease: 'power3' })
      const wrap = $('.float-photo')
      wrap.addEventListener('pointermove', (e) => {
        const r = wrap.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height
        ry((x - 0.5) * 16); rx((0.5 - y) * 12)
        fp.style.setProperty('--gx', `${x * 100}%`); fp.style.setProperty('--gy', `${y * 100}%`)
      })
      wrap.addEventListener('pointerleave', () => { rx(0); ry(0) })
    }
  }

  // ---------- writing effects ----------
  // labels and small captions decode out of noise as they arrive
  $$('.label').forEach((el) => ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => decode(el) }))
  // about: every word starts dim and lights up as you read down the page
  $$('.read').forEach((p) => {
    const w = splitWords(p)
    gsap.fromTo(w, { opacity: 0.14, filter: 'blur(1.5px)' }, { opacity: 1, filter: 'blur(0px)', ease: 'none', stagger: 0.08, scrollTrigger: { trigger: p, start: 'top 82%', end: 'bottom 50%', scrub: true } })
  })
  // project names scramble when you point at the card
  $$('.project').forEach((card) => card.addEventListener('pointerenter', () => decode($('h3', card), { duration: 0.6, spread: 0.5 })))
  // company names: letters drop in one by one
  $$('.job h3').forEach((h) => {
    const c = splitWordsToChars(h)
    gsap.from(c, { yPercent: 100, autoAlpha: 0, rotateX: -70, duration: 0.8, ease: 'expo.out', stagger: 0.025, scrollTrigger: { trigger: h, start: 'top 88%' } })
  })
  // contact: the outlined second line fills with colour as you scroll
  gsap.fromTo('.bl:last-child > span', { backgroundPosition: '100% 0' }, { backgroundPosition: '0% 0', ease: 'none', scrollTrigger: { trigger: '.big', start: 'top 75%', end: 'bottom 35%', scrub: true } })

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
    decode($('.p-tag', card))
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

  // ---------- code rain: each column scrolls forever, faster when you scroll ----------
  const rain = $$('.cr-col pre').map((pre, i) => {
    const t = gsap.fromTo(pre, { yPercent: 0 }, { yPercent: -50, duration: 50 + i * 12, ease: 'none', repeat: -1 })
    if (pre.parentElement.classList.contains('up')) t.progress(0.5).reversed(true)
    return t
  })
  lenis.on('scroll', (e) => rain.forEach((r) => gsap.to(r, { timeScale: 1 + Math.min(Math.abs(e.velocity) / 4, 8), duration: 0.3, overwrite: true })))

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

  $$('.job').forEach((j) => {
    gsap.fromTo(j, { '--line': 0 }, { '--line': 1, duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: j, start: 'top 85%' } })
    gsap.from(j.querySelectorAll('.when, .role-t, :scope > p'), { clipPath: 'inset(0 0 100% 0)', y: 24, duration: 1.1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: j, start: 'top 85%' } })
  })

  // ---------- contact: the green block opens out from a card to full width ----------
  gsap.fromTo('.contact', { clipPath: 'inset(6% 5% 0% 5% round 48px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top 95%', end: 'top 25%', scrub: true } })
  gsap.fromTo('.contact-sub', { clipPath: 'inset(0 0 100% 0)', y: 20 }, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.contact-sub', start: 'top 92%' } })

  // ---------- contact ----------
  gsap.from('.bl > span', { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.big', start: 'top 85%' } })
  gsap.from('.mail', { autoAlpha: 0, y: 30, duration: 1, scrollTrigger: { trigger: '.mail', start: 'top 92%' } })
  gsap.fromTo('.contact-sig', { clipPath: 'inset(-30% 100% -30% 0)' }, { clipPath: 'inset(-30% 0% -30% 0)', duration: 1.6, ease: 'power1.inOut', scrollTrigger: { trigger: '.contact-sig', start: 'top 95%' } })
} else {
  $$('.job').forEach((j) => j.classList.add('on'))
}
