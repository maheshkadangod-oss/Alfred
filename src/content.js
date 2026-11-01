// All site copy lives here. Source: alfiemax.com (live, 1 Nov 2026) and Alfred's LinkedIn.
// Lines marked CONFIRM disagree between the two, or need Alfred's sign-off before launch.

export const site = {
  name: 'Alfred Dominic',
  fullName: 'Alfred Dominic',
  handle: '@alfiemax',
  role: 'Solutions Architect and Full-Stack Engineer', // LinkedIn headline. Live site says "Senior Full-Stack Engineer". CONFIRM
  city: 'Kochi, Kerala, India',
  email: 'mailme@alfiemax.com',
  url: 'https://alfiemax.com',
  github: 'https://github.com/alfie-max',
  linkedin: 'https://linkedin.com/in/alfiemax',
  stackoverflow: 'https://stackoverflow.com/users/3125852/alfie',
}

export const seo = {
  title: 'Alfred Dominic · Solutions Architect and Full-Stack Engineer · Rails, React, AWS',
  description:
    'Alfred Dominic has spent 11+ years building SaaS platforms from zero to production across fintech, logistics, restaurant tech and more. Ruby on Rails, React, React Native, AWS. Based in Kochi, Kerala.',
}

export const hero = {
  eyebrow: 'Rails · React · React Native · AWS',
  first: 'Alfred',
  last: 'Dominic.',
  sub: '11+ years building SaaS products from the first commit to production. Backend architecture, product, and cloud, usually as the founding or only engineer.',
  primary: 'See the work',
  secondary: 'Get in touch',
  // the big chrome word at the bottom of the hero (his handle and domain)
  word: 'ALFIEMAX',
  roleA: 'Solutions Architect',
  roleB: '& full-stack engineer',
  // loader words, shown one after another before the big word lands
  intro: ['Alfred', 'Dominic'],
  // the line that appears after the burst. It is Alfred's own banner line.
  after: ['Complex systems.', 'Kept simple.'],
  afterSub: 'That was ten thousand moving parts. My job is making them feel like one.',
}

// CONFIRM: live site animates these from zero. Products = projects listed below. Industries = fintech,
// logistics, restaurant tech, marketing analytics, CRM, edtech, EV/IoT.
export const stats = [
  { value: '11+', label: 'Years shipping production software' },
  { value: '10+', label: 'Products built and launched' },
  { value: '7', label: 'Industries, from fintech to EV batteries' },
]

export const about = {
  title: 'Building products from zero to production for over a decade.',
  body: [
    "I've shipped production systems across fintech, logistics, restaurant tech, marketing analytics, CRM and edtech. Often as the founding or sole engineer on a small team where every decision sticks.",
    'My strength is owning the whole lifecycle: architecture, core systems, infrastructure and delivery. Right now I lead engineering at GoZip and run my own restaurant-ops suite: SmashPOS, Ledgr, PayLens and Pantry.',
  ],
}

export const projects = [
  { name: 'GoZip', tag: 'Moving SaaS', featured: true, text: 'Vertical SaaS for moving companies. Lead capture, quoting, scheduling, crew dispatch, time tracking, payments and payroll. Web app for the office, mobile app for crews.', stack: ['Rails', 'React', 'React Native', 'PostgreSQL', 'Twilio'] },
  { name: 'SmashPOS', tag: 'Restaurant POS', featured: true, text: 'Real-time restaurant system with POS, kitchen display, thermal printing, online ordering, split payments and analytics. Runs at $0 a month in hosting.', stack: ['Next.js', 'React', 'Convex', 'TypeScript'] },
  { name: 'Sydecar Ops Platform', tag: 'Fintech', featured: true, text: 'Internal operations admin for an SPV and fund platform. Deals, investors, compliance workflows, KYC onboarding and document tracking, in a 20+ engineer org.', stack: ['Rails', 'Node.js', 'React', 'PostgreSQL'] },
  { name: 'Ledgr', tag: 'Multi-store ledger', text: 'Sales and expense ledger for multi-store businesses. Payroll with attendance, role-based teams, dashboards and live POS sync. Works offline.', stack: ['Next.js', 'Convex', 'PWA'] },
  { name: 'PayLens', tag: 'Payout analytics', text: 'Reads weekly Swiggy and Zomato payout files and breaks down commissions, ads, discounts and real take-home.', stack: ['Next.js', 'PostgreSQL', 'Prisma', 'Python'] },
  { name: 'Pantry', tag: 'Inventory', text: 'Stock movement, supplier price lists and purchase lists grouped by supplier. Built phone-first for kitchen staff.', stack: ['Next.js', 'PostgreSQL', 'Prisma'] },
  { name: 'VoltUP', tag: 'EV / IoT', text: 'Backend for EV battery swapping with live tracking of batteries, vehicles and stations, plus the IoT data ingestion pipeline.', stack: ['Rails', 'PostgreSQL', 'MongoDB'] },
  { name: 'Clickx', tag: 'Marketing analytics', text: 'Reporting pipelines and dashboards across Google Ads, Facebook Ads and HubSpot.', stack: ['Rails', 'Google Ads API', 'HubSpot'] },
  { name: 'Dough', tag: 'CRM', text: 'Sole backend engineer. Contact and deal pipelines, notifications, full-text search and the AWS setup.', stack: ['Rails', 'Elasticsearch', 'AWS'] },
  { name: 'Learners India', tag: 'EdTech', text: 'Moved course delivery from file downloads to streaming and cut S3 storage costs.', stack: ['Rails', 'AWS S3'] },
]

export const experience = [
  // CONFIRM: LinkedIn says "Lead Engineer, Zip Moving Software". Live site says "Senior Full-Stack Engineer, GoZip".
  { when: '2024 to now', company: 'GoZip', role: 'Lead Engineer', text: 'Founding engineer on a vertical SaaS platform for moving companies. Took the core platform from idea to production with a two-engineer team.' },
  // CONFIRM: LinkedIn shows MakeMine Technologies (Founder & CEO, Mar 2018 to now). Not on the live site.
  { when: '2018 to now', company: 'MakeMine Technologies', role: 'Founder & CEO', text: 'My own studio in Kochi. Home of the restaurant-ops suite: SmashPOS, Ledgr, PayLens and Pantry.' },
  { when: '2021 to 2026', company: 'Sydecar', role: 'Software Engineer', text: 'Built the internal operations platform for a fintech infrastructure company. Owned investor onboarding, deal lifecycle and compliance workflows.' },
  { when: '2020 to 2021', company: 'Dough', role: 'Backend Engineer', text: 'Sole backend engineer for a SaaS CRM. Pipelines, full-text search and the AWS infrastructure.' },
  // CONFIRM: live site says 2017 to 2021. LinkedIn says Oct 2019 to present.
  { when: '2017 to 2021', company: 'Version One Labs', role: 'Senior Full-Stack Engineer', text: 'Backend systems for SaaS startups in two and three person teams. Shipped architecture for 3 to 4 production products, working straight with founders.' },
  { when: '2014 to 2017', company: 'Early career', role: 'Bislead, 7Nodes, Red Panthers', text: 'Virtual CTO at Bislead (UAE), Associate Team Lead at 7Nodes, Rails developer at Red Panthers. Led teams and mentored developers.' },
]

export const skills = [
  { group: 'Backend', items: ['Ruby on Rails', 'Node.js', 'REST APIs', 'Sidekiq', 'Microservices'] },
  { group: 'Frontend', items: ['React', 'React Native', 'TypeScript', 'Next.js', 'Tailwind CSS'] },
  { group: 'Data', items: ['PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Convex', 'Prisma'] },
  { group: 'Cloud', items: ['AWS', 'Docker', 'CI/CD', 'Elastic Beanstalk', 'Vercel'] },
  { group: 'Integrations', items: ['Stripe', 'Twilio', 'Google Ads API', 'Facebook Marketing', 'BigQuery'] },
]

export const contact = {
  title: ['Got a product', 'to build?'],
  sub: 'I take on a small number of freelance and consulting projects each year. Tell me what you are building and where it is stuck.',
}
