import { Navigate, useParams } from 'react-router-dom'
import Contact from '../sections/shared/Contact'
import Faqs from '../sections/shared/Faqs'
import DigitalGrowthHero from '../sections/services/DigitalGrowthHero'
import HowWeWork from '../sections/services/HowWeWork'
import WhatWeCanDo from '../sections/services/WhatWeCanDo'
import DataSolutionsHero from '../sections/services/DataSolutionsHero'
import DataWhyChooseUs from '../sections/services/DataWhyChooseUs'
import DataWhatWeDeliver from '../sections/services/DataWhatWeDeliver'
import DataProcess from '../sections/services/DataProcess'
import ServiceShowcaseTabs from '../sections/services/ServiceShowcaseTabs'
import WebSoftwareHero from '../sections/services/WebSoftwareHero'
import WebSoftwareProcess from '../sections/services/WebSoftwareProcess'
import WebSoftwareTech from '../sections/services/WebSoftwareTech'
import { SERVICE_PAGES } from '../data'

export default function ServicePage() {
  const { slug } = useParams()
  const service = SERVICE_PAGES[slug]

  if (!service) {
    return <Navigate to="/" replace />
  }

  if (slug === 'digital-growth') {
    return (
      <main className="service-page">
        <DigitalGrowthHero service={service} />
        <HowWeWork data={service.howWeWork} />
        <WhatWeCanDo items={service.whatWeCanDo} image={service.whatWeCanDoImage} />
        <Faqs items={service.faqs} />
        <Contact />
      </main>
    )
  }

  if (slug === 'data-solutions') {
    return (
      <main className="service-page">
        <DataSolutionsHero data={service.hero} />
        <DataWhyChooseUs data={service.whyChooseUs} />
        <DataWhatWeDeliver data={service.whatWeDeliver} />
        <DataProcess data={service.process} />
        <Faqs items={service.faqs} />
        <Contact />
      </main>
    )
  }

  if (slug === 'web-software-development') {
    return (
      <main className="service-page">
        <WebSoftwareHero data={service.hero} />
        <ServiceShowcaseTabs tabs={service.showcaseTabs} />
        <WebSoftwareTech data={service.technologies} />
        <WebSoftwareProcess data={service.process} />
        <Faqs items={service.faqs} />
        <Contact />
      </main>
    )
  }

  return <Navigate to="/" replace />
}
