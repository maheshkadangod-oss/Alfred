// Everything search engines and AI answer engines read: head tags, JSON-LD schema,
// sitemap.xml, robots.txt and llms.txt. All built from src/content.js so it never drifts from the page.
import { site, seo, hero, stats, about, projects, experience, skills, faq } from './content.js'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`
const U = site.url
const ID = { person: `${U}/#person`, site: `${U}/#website`, page: `${U}/#profile`, work: `${U}/#work`, faq: `${U}/#faq` }

export function schema(today) {
  const person = {
    '@type': 'Person',
    '@id': ID.person,
    name: site.fullName,
    alternateName: ['alfiemax', 'Alfie'],
    jobTitle: site.role,
    description: seo.description,
    url: `${U}/`,
    image: `${U}/og-image.jpg`,
    email: `mailto:${site.email}`,
    address: { '@type': 'PostalAddress', addressLocality: 'Kochi', addressRegion: 'Kerala', addressCountry: 'IN' },
    homeLocation: { '@type': 'Place', name: 'Kochi, Kerala, India' },
    worksFor: { '@type': 'Organization', name: 'GoZip' }, // CONFIRM: LinkedIn says Zip Moving Software
    founder: { '@type': 'Organization', name: 'MakeMine Technologies', address: { '@type': 'PostalAddress', addressLocality: 'Kochi', addressCountry: 'IN' } },
    hasOccupation: { '@type': 'Occupation', name: 'Solutions Architect', occupationLocation: { '@type': 'Country', name: 'India' }, skills: skills.flatMap((g) => g.items).join(', ') },
    knowsAbout: [...new Set(['SaaS architecture', 'Backend architecture', 'Cloud infrastructure', ...skills.flatMap((g) => g.items)])],
    sameAs: [site.linkedin, site.github, site.stackoverflow],
  }
  const website = { '@type': 'WebSite', '@id': ID.site, url: `${U}/`, name: `${site.fullName} · alfiemax`, inLanguage: 'en', publisher: { '@id': ID.person } }
  const page = {
    '@type': 'ProfilePage',
    '@id': ID.page,
    url: `${U}/`,
    name: seo.title,
    description: seo.description,
    inLanguage: 'en',
    isPartOf: { '@id': ID.site },
    mainEntity: { '@id': ID.person },
    about: { '@id': ID.person },
    primaryImageOfPage: { '@type': 'ImageObject', url: `${U}/og-image.jpg`, width: 1200, height: 630 },
    dateModified: today,
    hasPart: [{ '@id': ID.work }, { '@id': ID.faq }],
  }
  const work = {
    '@type': 'ItemList',
    '@id': ID.work,
    name: 'Products Alfred Dominic has built',
    numberOfItems: projects.length,
    itemListElement: projects.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: { '@type': 'SoftwareApplication', name: p.name, applicationCategory: 'BusinessApplication', description: p.text, keywords: p.stack.join(', '), creator: { '@id': ID.person } },
    })),
  }
  const faqPage = {
    '@type': 'FAQPage',
    '@id': ID.faq,
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
  return { '@context': 'https://schema.org', '@graph': [person, website, page, work, faqPage] }
}

export function headTags(today) {
  const img = `${U}/og-image.jpg`
  return [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}" />`,
    `<link rel="canonical" href="${U}/" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />`,
    `<meta name="author" content="${esc(site.fullName)}" />`,
    `<meta name="geo.region" content="IN-KL" />`,
    `<meta name="geo.placename" content="Kochi" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:site_name" content="${esc(site.fullName)}" />`,
    `<meta property="og:title" content="${esc(seo.title)}" />`,
    `<meta property="og:description" content="${esc(seo.description)}" />`,
    `<meta property="og:url" content="${U}/" />`,
    `<meta property="og:image" content="${img}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(site.fullName)}, drawn in dots, above the word ALFIEMAX" />`,
    `<meta property="profile:first_name" content="Alfred" />`,
    `<meta property="profile:last_name" content="Dominic" />`,
    `<meta property="profile:username" content="alfiemax" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(seo.title)}" />`,
    `<meta name="twitter:description" content="${esc(seo.description)}" />`,
    `<meta name="twitter:image" content="${img}" />`,
    `<link rel="me" href="${site.linkedin}" />`,
    `<link rel="me" href="${site.github}" />`,
    `<link rel="alternate" type="text/plain" href="/llms.txt" title="Summary for AI assistants" />`,
    `<link rel="sitemap" type="application/xml" href="/sitemap.xml" />`,
    `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`,
    ld(schema(today)),
  ].join('\n    ')
}

export const sitemap = (today) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${U}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
    <image:image><image:loc>${U}/og-image.jpg</image:loc></image:image>
    <image:image><image:loc>${U}/img/alfred-desk.webp</image:loc></image:image>
  </url>
</urlset>
`

// AI crawlers are allowed on purpose: being quoted by ChatGPT, Perplexity and Google AI answers is the goal.
export const robots = () => `User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: ${U}/sitemap.xml
`

// llms.txt: a plain summary that AI assistants can read in one go (llmstxt.org)
export const llmsTxt = () => `# ${site.fullName}

> ${seo.description}

${site.fullName} (alfiemax) is a ${site.role.toLowerCase()} in ${site.city}. ${hero.sub}

## Facts
${stats.map((s) => `- ${s.value} ${s.label[0].toLowerCase() + s.label.slice(1)}`).join('\n')}
- Contact: ${site.email}
- LinkedIn: ${site.linkedin}
- GitHub: ${site.github}
- Stack Overflow: ${site.stackoverflow}

## About
${about.body.join('\n\n')}

## Products built
${projects.map((p) => `- **${p.name}** (${p.tag}): ${p.text} Stack: ${p.stack.join(', ')}.`).join('\n')}

## Experience
${experience.map((e) => `- ${e.when}: ${e.role}, ${e.company}. ${e.text}`).join('\n')}

## Skills
${skills.map((g) => `- ${g.group}: ${g.items.join(', ')}`).join('\n')}

## Questions
${faq.map((f) => `### ${f.q}\n${f.a}`).join('\n\n')}
`
