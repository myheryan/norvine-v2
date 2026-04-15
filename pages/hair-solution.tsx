import { NextPage } from 'next'

import { ComingSoon } from '../components/landing'
import HeadMeta from '@/components/HeadMeta'

const HairSolution: NextPage = () => {
  return (
    <>
        <HeadMeta />
    
        <div className="flex min-h-screen">
      <main className="flex w-full  flex-1 flex-col">
        <ComingSoon />
      </main>

      {/* <footer className="flex h-24 w-full items-center justify-center border-t"></footer> */}
    </div>
    </>

  )
}

export default HairSolution
