import Hero from '../sections/Hero'
import LogoCloud from '../sections/LogoCloud'
import WhatWeDo from '../sections/WhatWeDo'
import Services from '../sections/Services'
import WhyChooseUs from '../sections/WhyChooseUs'
import Faqs from '../sections/Faqs'
import Contact from '../sections/Contact'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <LogoCloud />
      <WhatWeDo />
      <Services />
      <WhyChooseUs />
      <Faqs />
      <Contact />
    </main>
  )
}
