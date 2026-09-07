import Hero from '../sections/home/Hero'
import WhatWeDo from '../sections/home/WhatWeDo'
import HowWeHelp from '../sections/home/HowWeHelp'
import WhyChooseUs from '../sections/home/WhyChooseUs'
import Faqs from '../sections/shared/Faqs'
import Contact from '../sections/shared/Contact'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <WhatWeDo />
      <HowWeHelp />
      <WhyChooseUs />
      <Faqs />
      <Contact />
    </main>
  )
}
