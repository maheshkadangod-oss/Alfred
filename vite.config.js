import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// Pre-renders the page to static HTML at build time, so crawlers and AI assistants
// read the full text (the old site showed "0+ Years" to Google because counters started at zero).
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const fileUrl = (id) => pathToFileURL(resolve(process.cwd(), '.' + id)).href + '?t=' + Date.now()
const load = async (server, id) => (server ? server.ssrLoadModule(id) : import(fileUrl(id)))

function prerender() {
  let server
  return {
    name: 'prerender',
    configureServer(s) { server = s },
    async transformIndexHtml(html) {
      const { renderHome, navHtml, footerHtml } = await load(server, '/src/render.js')
      const { site, seo } = await load(server, '/src/content.js')
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: site.fullName,
        jobTitle: site.role,
        url: site.url,
        email: 'mailto:' + site.email,
        address: { '@type': 'PostalAddress', addressLocality: 'Kochi', addressRegion: 'Kerala', addressCountry: 'IN' },
        sameAs: [site.github, site.linkedin, site.stackoverflow],
        knowsAbout: ['Ruby on Rails', 'React', 'React Native', 'Node.js', 'PostgreSQL', 'AWS', 'SaaS architecture'],
      }
      const head = [
        `<title>${esc(seo.title)}</title>`,
        `<meta name="description" content="${esc(seo.description)}" />`,
        `<link rel="canonical" href="${site.url}/" />`,
        `<meta name="author" content="${esc(site.fullName)}" />`,
        `<meta property="og:type" content="profile" />`,
        `<meta property="og:title" content="${esc(seo.title)}" />`,
        `<meta property="og:description" content="${esc(seo.description)}" />`,
        `<meta property="og:url" content="${site.url}/" />`,
        `<meta property="og:image" content="${site.url}/og-image.jpg" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`,
      ].join('\n    ')
      return html
        .replace('<!--seo-head-->', head)
        .replace('<!--nav-->', navHtml())
        .replace('<!--app-->', renderHome())
        .replace('<!--foot-->', footerHtml())
    },
  }
}

export default defineConfig({ plugins: [prerender()] })
