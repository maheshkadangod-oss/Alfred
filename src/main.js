import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { createOrb } from './orb.js'

// Page HTML is pre-rendered at build time (src/render.js). This file only adds motion.
gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })
const crawler = /bot|crawl|spider|slurp|lighthouse|preview/i.test(navigator.userAgent)
const reduced = crawler || window.matchMedia('(prefers-reduced-motion: reduce)').matches
const phone = window.matchMedia('(max-width: 700px)').matches

// ---------- smooth scroll ----------
const lenis = new Lenis({ lerp: 0.1, smoothWheel: !reduced })
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((t) => lenis.raf(t * 1000))
gsap.ticker.lagSmoothing(0)
document.querySelectorAll('a[href^="#"]').forEach((a) =>
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href')
    if (id.length < 2) return
    e.preventDefault()
    lenis.scrollTo(id === '#top' ? 0 : id, { offset: -70, duration: 1.4, immediate: reduced })
  })
)
const nav = document.querySelector('.nav')
ScrollTrigger.create({ start: 80, end: 'max', onToggle: (st) => nav.classList.toggle('solid', st.isActive) })

// ---------- hero: the bomb ----------
const canvas = document.querySelector('.orb')
// 10,000 on desktop. Phones get 5,000: same look on a small screen, half the GPU work.
const orb = canvas && !reduced ? createOrb(canvas, { count: phone ? 5000 : 10000 }) : null
if (!orb) document.body.classList.add('no-orb')

const video = document.querySelector('.portrait-video')
let videoStarted = false
function startVideo() {
  if (videoStarted || !video) return
  videoStarted = true
  // only loads if public/video/hero.mp4 exists; otherwise the poster photo stays
  fetch(video.dataset.src, { method: 'HEAD' }).then((r) => {
    if (r.ok && (r.headers.get('content-type') || '').startsWith('video')) {
      video.src = video.dataset.src
      video.play().catch(() => {})
    }
  }).catch(() => {})
}

if (!reduced) {
  // intro: name rises in while the bomb fades up
  gsap.from('.name-line', { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.08, delay: 0.15 })
  gsap.from(['.eyebrow', '.hero-sub', '.hero-ctas', '.hint'], { autoAlpha: 0, y: 18, duration: 1, ease: 'power3.out', stagger: 0.07, delay: 0.5 })
  gsap.from(canvas, { autoAlpha: 0, scale: 0.7, duration: 1.8, ease: 'expo.out' })

  const stage = { charge: 0, burst: 0 }
  const push = () => orb && orb.set(stage.charge, stage.burst)
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: phone ? '+=130%' : '+=170%',
      pin: '.hero-stage',
      scrub: 0.9,
      onUpdate: (st) => { if (st.progress > 0.3) startVideo() },
    },
  })
  // 0.00 to 0.22  charge up: the text clears out of the way, the bomb tightens and glows
  tl.to(stage, { charge: 1, duration: 0.22, ease: 'power2.in', onUpdate: push }, 0)
  tl.to('.hero-a', { autoAlpha: 0, y: -40, filter: 'blur(6px)', duration: 0.16 }, 0.02)
  tl.to('.hint', { autoAlpha: 0, duration: 0.06 }, 0)
  // 0.22  detonation: flash, shockwave ring, particles fly
  tl.fromTo('.flash', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.025 }, 0.215)
  tl.to('.flash', { autoAlpha: 0, duration: 0.12, ease: 'power2.out' }, 0.24)
  tl.fromTo('.shock', { scale: 0.25, autoAlpha: 0 }, { scale: 5, autoAlpha: 0.9, duration: 0.05 }, 0.22)
  tl.to('.shock', { scale: 9, autoAlpha: 0, duration: 0.2, ease: 'power2.out' }, 0.27)
  tl.to(stage, { burst: 1, duration: 0.6, ease: 'power1.out', onUpdate: push }, 0.22)
  tl.to(canvas, { scale: 1.15, duration: 0.6 }, 0.22)
  // 0.40 to 1.00  what is left behind: Alfred, and one simple line
  tl.fromTo('.portrait', { autoAlpha: 0, scale: 1.12, filter: 'blur(14px)' }, { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 0.4, ease: 'power2.out' }, 0.38)
  tl.fromTo('.after span', { autoAlpha: 0, yPercent: 60 }, { autoAlpha: 1, yPercent: 0, stagger: 0.06, duration: 0.25, ease: 'power3.out' }, 0.5)
  tl.fromTo('.after-sub', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 0.62)
  tl.to({}, { duration: 0.15 }) // short hold before the page moves on
} else {
  document.body.classList.add('still')
}

// ---------- section reveals ----------
if (!reduced) {
  document.querySelectorAll('.split').forEach((h) =>
    gsap.from(h.querySelectorAll('.w > span'), { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.035, scrollTrigger: { trigger: h, start: 'top 85%' } })
  )
  gsap.utils.toArray('.reveal').forEach((el) =>
    gsap.from(el, { autoAlpha: 0, y: 36, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } })
  )
  gsap.from('.big span', { yPercent: 100, autoAlpha: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.big', start: 'top 85%' } })
  // project cards tilt toward the cursor a little
  document.querySelectorAll('.project').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
      card.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
    })
  })
}
