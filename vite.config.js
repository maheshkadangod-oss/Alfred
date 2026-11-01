import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// Pre-renders the page to static HTML at build time, so crawlers and AI assistants read the full text
// (the old site showed "0+ Years" to Google because its counters started at zero). Also writes
// sitemap.xml, robots.txt and llms.txt from the same content (see src/seo.js).
const fileUrl = (id) => pathToFileURL(resolve(process.cwd(), '.' + id)).href + '?t=' + Date.now()
const load = async (server, id) => (server ? server.ssrLoadModule(id) : import(fileUrl(id)))
const today = () => new Date().toISOString().slice(0, 10)

function prerender() {
  let server
  return {
    name: 'prerender',
    configureServer(s) { server = s },
    async transformIndexHtml(html) {
      const { renderHome, navHtml, footerHtml } = await load(server, '/src/render.js')
      const { headTags } = await load(server, '/src/seo.js')
      return html
        .replace('<!--seo-head-->', headTags(today()))
        .replace('<!--nav-->', navHtml())
        .replace('<!--app-->', renderHome())
        .replace('<!--foot-->', footerHtml())
    },
    async generateBundle() {
      const seo = await import(fileUrl('/src/seo.js'))
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: seo.sitemap(today()) })
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: seo.robots() })
      this.emitFile({ type: 'asset', fileName: 'llms.txt', source: seo.llmsTxt() })
    },
  }
}

export default defineConfig({ plugins: [prerender()] })
