// Builds the page HTML as plain strings at build time (see vite.config.js).
// Crawlers get every word without running JavaScript.
import { site, hero, stats, about, projects, experience, skills, contact } from './content.js'

const ext = 'target="_blank" rel="noopener"'
const sections = [['about', 'About'], ['work', 'Work'], ['experience', 'Experience'], ['contact', 'Contact']]
const words = (t) => t.split(' ').map((w) => `<span class="w"><span>${w}</span></span>`).join(' ')
const chars = (t) => [...t].map((c) => `<span class="ch">${c}</span>`).join('')

export function navHtml() {
  return `<div class="backdrop" aria-hidden="true"></div>
    <canvas class="orb" aria-hidden="true"></canvas>
    <div class="grain" aria-hidden="true"></div>
    <div class="cursor" aria-hidden="true"><i class="c-dot"></i><i class="c-ring"><span></span></i></div>
    <div class="loader" aria-hidden="true"><span class="l-sign sig">${site.name}</span><i class="l-dot"></i></div>
    <header class="nav">
      <a href="#top" class="logo sig" aria-label="${site.name}, back to top">${site.name}</a>
      <nav aria-label="Main" class="nav-links">
        ${sections.map(([id, label]) => `<a href="#${id}">${label}</a>`).join('')}
      </nav>
      <a href="mailto:${site.email}" class="nav-cta magnetic">Let's talk</a>
    </header>`
}

// A small architecture diagram for each project, drawn from its stack:
// Users -> the core framework -> everything it talks to. Dots travel the wires.
function diagram(p, n) {
  const pill = (label, cx, cy, cls = '') => {
    const w = Math.max(56, label.length * 7 + 26)
    return { label, cx, cy, w, l: cx - w / 2, r: cx + w / 2, svg: `<g class="node ${cls}"><rect x="${cx - w / 2}" y="${cy - 14}" width="${w}" height="28" rx="14"/><text x="${cx}" y="${cy + 4}">${label}</text></g>` }
  }
  const [core, ...rest] = p.stack
  const users = pill('Users', 44, 120, 'ghost')
  const hub = pill(core, 168, 120, 'hub')
  const outs = rest.map((s, j) => pill(s, 330, 120 + (j - (rest.length - 1) / 2) * 46))
  const wire = (a, b, id) => `<path id="${id}" class="wire" d="M${a.r} ${a.cy} C ${(a.r + b.l) / 2} ${a.cy}, ${(a.r + b.l) / 2} ${b.cy}, ${b.l} ${b.cy}"/>`
  const wires = [wire(users, hub, `w${n}-0`), ...outs.map((o, j) => wire(hub, o, `w${n}-${j + 1}`))]
  const dots = wires.map((_, j) => `<circle r="2.6" class="pulse"><animateMotion dur="${2.4 + (j % 3) * 0.5}s" begin="${j * 0.35}s" repeatCount="indefinite"><mpath href="#w${n}-${j}"/></animateMotion></circle>`)
  return `<svg class="diagram" viewBox="0 0 400 240" role="img" aria-label="${p.name} architecture: ${p.stack.join(', ')}">
          ${wires.join('')}${dots.join('')}${users.svg}${hub.svg}${outs.map((o) => o.svg).join('')}
        </svg>`
}

function heroHtml() {
  return `<section class="hero" id="top" aria-label="Introduction">
      <div class="hero-stage">
        <div class="flash" aria-hidden="true"></div>
        <div class="shock" aria-hidden="true"></div>
        <img class="cutout" src="/img/alfred-cutout.webp" alt="" aria-hidden="true" width="591" height="820" />
        <div class="hero-a">
          <p class="eyebrow">${hero.eyebrow}</p>
          <p class="hero-sub">${hero.sub}</p>
          <div class="hero-ctas">
            <a href="#work" class="btn btn-solid magnetic">${hero.primary}<span aria-hidden="true">→</span></a>
            <a href="#contact" class="btn magnetic">${hero.secondary}</a>
          </div>
        </div>
        <div class="hero-b">
          <p class="after" aria-hidden="true">${hero.after.map((l) => `<span>${l}</span>`).join('')}</p>
          <p class="after-sub" aria-hidden="true">${hero.afterSub}</p>
        </div>
        <ul class="after-stats" aria-label="In numbers">
          ${stats.map((s) => `<li><strong data-to="${s.value}">${s.value}</strong><span>${s.label}</span></li>`).join('')}
        </ul>
        <div class="hero-foot">
          <p class="sig hero-sig" aria-hidden="true">${site.name}</p>
          <h1 class="word chrome" aria-label="${site.fullName}, ${hero.word}">${chars(hero.word)}</h1>
          <div class="hero-meta">
            <p class="role"><b>${hero.roleA}</b> <i>${hero.roleB}</i></p>
            <p class="where">${site.city}</p>
          </div>
        </div>
      </div>
    </section>`
}

export function renderHome() {
  const marquee = skills.flatMap((g) => g.items)
  const half = Math.ceil(marquee.length / 2)
  const row = (items) => `<div class="mq-row"><div class="mq-track">${[...items, ...items].map((s) => `<span>${s}</span><i>✦</i>`).join('')}</div></div>`
  return `${heroHtml()}

    <section class="block about" id="about">
      <div class="about-grid">
        <div class="about-copy">
          <p class="label">About</p>
          <h2 class="split">${words(about.title)}</h2>
          <div class="about-body">${about.body.map((p) => `<p class="read">${p}</p>`).join('')}</div>
        </div>
        <figure class="float-photo">
          <div class="fp-card">
            <img src="/img/alfred-desk.webp" alt="${site.fullName} working at his laptop by a window at night" width="591" height="1024" loading="lazy" />
            <i class="fp-glare" aria-hidden="true"></i>
          </div>
          <figcaption class="fp-chip"><i></i>${about.photoCaption}</figcaption>
          <span class="fp-tag">${about.photoTag}</span>
        </figure>
      </div>
    </section>

    <section class="marquee" aria-label="Tools I use">
      ${row(marquee.slice(0, half))}
      ${row(marquee.slice(half)).replace('mq-row', 'mq-row rev')}
    </section>

    <section class="work" id="work">
      <div class="work-pin">
        <div class="work-head">
          <div><p class="label">Work</p><h2 class="split">${words("Things I've built.")}</h2></div>
          <div class="work-count" aria-hidden="true"><b class="wc-now">01</b><span>/ ${String(projects.length).padStart(2, '0')}</span><i class="wc-bar"><i></i></i></div>
        </div>
        <div class="work-track">
          ${projects.map((p, i) => `<article class="project${p.featured ? ' featured' : ''}">
            <div class="p-inner">
              <div class="p-top"><span class="p-num">${String(i + 1).padStart(2, '0')}</span><span class="p-tag">${p.tag}</span></div>
              ${diagram(p, i)}
              <h3>${p.name}</h3>
              <p class="p-text">${p.text}</p>
              <ul class="chips">${p.stack.map((s) => `<li>${s}</li>`).join('')}</ul>
            </div>
          </article>`).join('')}
        </div>
      </div>
    </section>


    <section class="block experience" id="experience">
      <p class="label">Experience</p>
      <h2 class="split">${words("Where I've worked.")}</h2>
      <ol class="timeline">
        <i class="tl-fill" aria-hidden="true"></i>
        ${experience.map((e) => `<li class="job">
          <span class="when">${e.when}</span>
          <div><h3>${e.company}</h3><p class="role-t">${e.role}</p></div>
          <p>${e.text}</p>
        </li>`).join('')}
      </ol>
    </section>

    <section class="contact" id="contact">
      <div class="contact-in">
        <p class="label">Contact</p>
        <h2 class="big">${contact.title.map((l) => `<span class="bl"><span>${l}</span></span>`).join('')}</h2>
        <p class="contact-sub">${contact.sub}</p>
        <a class="mail magnetic" href="mailto:${site.email}">${site.email}<span aria-hidden="true">↗</span></a>
        <p class="sig contact-sig" aria-hidden="true">${site.name}</p>
      </div>
    </section>`
}

export function footerHtml() {
  return `<footer class="foot">
      <span>© ${new Date().getFullYear()} ${site.fullName} · ${site.city}</span>
      <nav aria-label="Elsewhere">
        <a href="${site.github}" ${ext}>GitHub</a>
        <a href="${site.linkedin}" ${ext}>LinkedIn</a>
        <a href="${site.stackoverflow}" ${ext}>Stack Overflow</a>
      </nav>
    </footer>`
}
