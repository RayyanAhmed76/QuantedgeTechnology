import { WHAT_WE_DO } from './home'

/** Overview list: same services as the home pillars. */
export const SERVICES_OVERVIEW = WHAT_WE_DO.map((service) => ({
  ...service,
  href: service.href || '/contact',
  cta: service.href ? 'Learn more' : 'Talk to us',
  external:
    typeof service.href === 'string' && /^https?:\/\//i.test(service.href),
}))

export const SERVICES_HOW_WE_WORK = [
  {
    number: '01',
    title: 'Understand Your Goal',
    copy: "We start by learning what you're actually trying to achieve: more visibility, better data, or a working product, so the right service (or combination) becomes obvious, not guessed at.",
    image: '/assets/consultancy.webp',
  },
  {
    number: '02',
    title: 'Scope It Clearly',
    copy: "We define exactly what's included, what it costs, and what you'll get before any work starts. No vague retainers, no scope creep along the way.",
    image: '/assets/service-2.webp',
  },
  {
    number: '03',
    title: 'Build and Execute',
    copy: "Whether it's a campaign, a dashboard, or a full application, we do the actual work directly, with the person doing it, not routed through account layers.",
    image: '/assets/deployment.webp',
  },
  {
    number: '04',
    title: 'Support What We Build',
    copy: "Launch isn't the finish line. We stick around for the fixes, updates, and ongoing support that keep what we built actually working.",
    image: '/assets/it-support.webp',
  },
]

export const SERVICES_PAGE_FAQS = [
  {
    q: 'How do I know which service is right for my business?',
    a: "You don't need to figure that out alone. Tell us what you're trying to achieve (a new site or product, clearer data, more pipeline) and we'll point you to the right service, or a combination of them.",
  },
  {
    q: 'Can I use more than one service at the same time?',
    a: 'Yes. Many clients combine services, for example Digital Growth alongside a new web build, or Data Solutions feeding campaign decisions. We will scope a combined engagement when that fits.',
  },
  {
    q: 'Do you work with businesses of my size?',
    a: "We work with businesses at different stages. You don't need to be a large company to benefit from focused delivery. What matters more is a real goal or problem worth solving.",
  },
  {
    q: 'How is pricing structured across your services?',
    a: 'Pricing depends on scope. A landing page and a full platform are different amounts of work. We will give you clear, upfront pricing before anything starts.',
  },
  {
    q: 'Do you only advise, or do you also build?',
    a: 'We build and ship. Web & software, data platforms, and growth execution are done by the same team, not handed off to another agency after a strategy deck.',
  },
  {
    q: 'How do we get started?',
    a: 'Reach out through the contact form. Share your goals and current setup. We will follow up with next steps and a clear quote path.',
  },
]
