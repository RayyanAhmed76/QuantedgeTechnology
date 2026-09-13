import Contact from '../sections/shared/Contact'
import Faqs from '../sections/shared/Faqs'
import ServicesFeatureList from '../sections/services/ServicesFeatureList'
import ServicesHero from '../sections/services/ServicesHero'
import ServicesHowWeWork from '../sections/services/ServicesHowWeWork'
import { SERVICES_PAGE_FAQS } from '../data/servicesOverview'

export default function ServicesPage() {
  return (
    <main className="service-page services-index">
      <ServicesHero />
      <ServicesFeatureList />
      <ServicesHowWeWork />
      <Faqs items={SERVICES_PAGE_FAQS} />
      <Contact />
    </main>
  )
}
