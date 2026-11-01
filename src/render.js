// Builds the page HTML as plain strings at build time (see vite.config.js).
import { site, hero, stats, about, projects, experience, skills, contact } from './content.js'

const ext = 'target="_blank" rel="noopener"'
const sections = [['about', 'About'], ['work', 'Work'], ['experience', 'Experience'], ['contact', 'Contact']]
const words = (t) => t.split(' ').map((w) => `<span class="w"><span>${w}</span></span>`).join(' ')

export function navHtml() {
  return `<header class="nav">
      <a href="#top" class="logo" aria-label="${site.name}, back to top"><b>AD</b><span>${site.handle}</span></a>
      <nav aria-label="Main" class="nav-links">
        ${sections.map(([id, label]) => `<a href="#${id}">${label}</a>`).join('')}
      </nav>
      <a href="mailto:${site.email}" class="nav-cta">Let's talk</a>
    </header>`
}

function heroHtml() {
  return `<section class="hero" id="top" aria-label="Introduction">
      <div class="hero-stage">
        <canvas class="orb" aria-hidden="true"></canvas>
        <div class="shock" aria-hidden="true"></div>
        <div class="flash" aria-hidden="true"></div>
        <figure class="portrait" aria-hidden="true">
          <video class="portrait-video" muted loop playsinline preload="none" poster="/img/alfred-night.webp" data-src="/video/hero.mp4"></video>
        </figure>
        <div class="hero-a">
          <p class="eyebrow"><i></i>${hero.eyebrow}</p>
          <h1 class="name"><span class="name-line">${hero.first}</span><span class="name-line">${hero.last}</span></h1>
          <p class="hero-sub">${hero.sub}</p>
          <div class="hero-ctas">
            <a href="#work" class="btn btn-solid">${hero.primary}<span aria-hidden="true">→</span></a>
            <a href="#contact" class="btn">${hero.secondary}</a>
          </div>
        </div>
        <div class="hero-b" aria-hidden="true">
          <p class="after">${hero.after.map((l) => `<span>${l}</span>`).join('')}</p>
          <p class="after-sub">${hero.afterSub}</p>
        </div>
        <p class="hint" aria-hidden="true"><span></span>${hero.hint}</p>
      </div>
    </section>`
}

export function renderHome() {
  return `${heroHtml()}
    <section class="stats" aria-label="In numbers">
      ${stats.map((s) => `<div class="stat reveal"><strong>${s.value}</strong><span>${s.label}</span></div>`).join('')}
    </section>

    <section class="block about" id="about">
      <p class="label">01 · About</p>
      <h2 class="split">${words(about.title)}</h2>
      <div class="about-body">${about.body.map((p) => `<p class="reveal">${p}</p>`).join('')}</div>
    </section>

    <section class="block work" id="work">
      <p class="label">02 · Work</p>
      <h2 class="split">${words("Things I've built.")}</h2>
      <div class="projects">
        ${projects.map((p, i) => `<article class="project reveal${p.featured ? ' featured' : ''}">
          <span class="p-num">${String(i + 1).padStart(2, '0')}</span>
          <p class="p-tag">${p.tag}</p>
          <h3>${p.name}</h3>
          <p class="p-text">${p.text}</p>
          <ul class="chips">${p.stack.map((s) => `<li>${s}</li>`).join('')}</ul>
        </article>`).join('')}
      </div>
    </section>

    <section class="block experience" id="experience">
      <p class="label">03 · Experience</p>
      <h2 class="split">${words("Where I've worked.")}</h2>
      <ol class="timeline">
        ${experience.map((e) => `<li class="job reveal">
          <span class="when">${e.when}</span>
          <div><h3>${e.company}</h3><p class="role">${e.role}</p></div>
          <p>${e.text}</p>
        </li>`).join('')}
      </ol>
      <div class="skills">
        ${skills.map((g) => `<div class="skill reveal"><h3>${g.group}</h3><ul>${g.items.map((s) => `<li>${s}</li>`).join('')}</ul></div>`).join('')}
      </div>
    </section>

    <section class="block contact" id="contact">
      <p class="label">04 · Contact</p>
      <h2 class="big">${contact.title.map((l) => `<span>${l}</span>`).join('')}</h2>
      <p class="contact-sub reveal">${contact.sub}</p>
      <a class="mail reveal" href="mailto:${site.email}">${site.email}<span aria-hidden="true">↗</span></a>
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
