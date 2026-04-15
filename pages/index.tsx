import type { NextPage } from 'next'

import {
  BestSeller,
  ChooseSupplement,
  Composition,
  MainCarousel,
  Overview,
  PartOfUs,
  VerificationLanding,
  ContactUs,
  Instagram,
} from '../components/landing'
import HeadMeta from '@/components/HeadMeta'

const Home: NextPage = () => {
  return (
    <>
    <HeadMeta />
    <div className="flex min-h-screen">
      <main className="flex w-full flex-1 flex-col">
        <MainCarousel />
        <Overview />
        <BestSeller />
        <Composition />
        <ChooseSupplement />
        <VerificationLanding />
        <PartOfUs />
        <Instagram />
        <ContactUs />
      </main>

      {/* <footer className="flex h-24 w-full items-center justify-center border-t"></footer> */}
    </div>
  </>

  )
}

export default Home
