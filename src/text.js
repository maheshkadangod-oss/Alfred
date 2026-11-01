// Writing effects. Text stays real HTML for crawlers; these only animate what is already there.

// Decode: each letter flickers through random characters in moss green, then settles,
// roughly left to right. The element's width is locked while it runs so lines never jump.
const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+=<>/'
const rand = () => GLYPHS[(Math.random() * GLYPHS.length) | 0]
const esc = (c) => (c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c)

export function decode(el, { duration = 0.9, spread = 0.7 } = {}) {
  if (el._decoding) return
  el._decoding = true
  const text = el.dataset.text || (el.dataset.text = el.textContent)
  const r = el.getBoundingClientRect()
  const prev = { display: el.style.display, width: el.style.width, whiteSpace: el.style.whiteSpace }
  if (getComputedStyle(el).display === 'inline') el.style.display = 'inline-block'
  el.style.width = r.width + 'px'
  el.style.whiteSpace = 'nowrap'
  const at = [...text].map((ch, i) => (ch === ' ' ? 0 : (i / Math.max(text.length, 1)) * spread + Math.random() * (1 - spread)))
  const start = performance.now()
  let last = 0
  function tick(now) {
    const p = (now - start) / 1000 / duration
    if (p >= 1) {
      el.textContent = text
      Object.assign(el.style, prev)
      el._decoding = false
      return
    }
    if (now - last > 45) {
      last = now
      let html = ''
      for (let i = 0; i < text.length; i++) html += p >= at[i] || text[i] === ' ' ? esc(text[i]) : `<i class="gl">${esc(rand())}</i>`
      el.innerHTML = html
    }
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

// Split a paragraph into word spans for the scroll highlight.
export function splitWords(el) {
  el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="hw">${esc(w)}</span>`).join(' ')
  return [...el.querySelectorAll('.hw')]
}
