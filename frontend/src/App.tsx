import { useState } from 'react'
import { Hero } from './hero/Hero'
import { CommitteeGrid } from './committees/CommitteeGrid'
import { FundingSection } from './funding/FundingSection'
import { RsoSearch } from './rsos/RsoSearch'
import { AwardsSection } from './awards/AwardsSection'
import { ExpendituresSection } from './expenditures/ExpendituresSection'
import { CycleNav } from './nav/CycleNav'
import { useAllocations } from './data/useAllocations'
import { DEFAULT_CYCLE, type CycleSlug } from './data/cycles'
import './App.css'

export default function App() {
  const [cycle, setCycle] = useState<CycleSlug>(DEFAULT_CYCLE)
  const { data, error } = useAllocations(cycle)

  const handleSelectCycle = (slug: CycleSlug) => {
    setCycle(slug)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleScrollPastHero = () => {
    document
      .getElementById('committees')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (error) {
    return (
      <>
        <CycleNav current={cycle} onSelect={handleSelectCycle} />
        <main className="app-status">
          <h1>Couldn&rsquo;t load allocations</h1>
          <p>{error.message}</p>
        </main>
      </>
    )
  }

  if (!data) {
    return (
      <>
        <CycleNav current={cycle} onSelect={handleSelectCycle} />
        <main className="app-status">
          <p>Loading allocations&hellip;</p>
        </main>
      </>
    )
  }

  return (
    <>
      <CycleNav current={cycle} onSelect={handleSelectCycle} />
      <main className="app">
        <Hero key={`hero-${cycle}`} data={data} onScrollPastHero={handleScrollPastHero} />
        <CommitteeGrid key={`committees-${cycle}`} data={data} />
        <FundingSection key={`funding-${cycle}`} data={data} />
        <AwardsSection key={`awards-${cycle}`} data={data} />
        <RsoSearch key={`rsos-${cycle}`} data={data} />
        <ExpendituresSection key={`expenditures-${cycle}`} data={data} />
        <footer className="app-foot">
          <p>
            UChicago Undergraduate Student Government &middot; {cycle} allocations.{' '}
            <a
              href="https://voices.uchicago.edu/ucusg/"
              target="_blank"
              rel="noreferrer"
            >
              About USG
            </a>
          </p>
          <p className="app-foot-credits">
            Built by Alex Noh, Fred Lee, John Sellers &amp; Adrian Dai.
          </p>
        </footer>
      </main>
    </>
  )
}
