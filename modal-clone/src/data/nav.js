export const NAV = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  {
    label: 'Services',
    to: '/services',
    children: [
      {
        label: 'All Services',
        description: 'Overview of everything we build and deliver',
        to: '/services',
        icon: 'web',
      },
      {
        label: 'Web & Software Development',
        description: 'Sites, apps, e-commerce, and automation',
        to: '/services/web-software-development',
        icon: 'web',
      },
      {
        label: 'Data Solutions',
        description: 'Analytics, dashboards, and AI insights',
        to: '/services/data-solutions',
        icon: 'data',
      },
      {
        label: 'Digital Growth',
        description: 'SEO, paid media, and conversion work',
        to: '/services/digital-growth',
        icon: 'growth',
      },
    ],
  },
  { label: 'Career', to: '/career' },
]
