import { useEffect, useState } from 'react'
import { Hero } from './hero/Hero'
import { CommitteeGrid } from './committees/CommitteeGrid'
import { FundingSection } from './funding/FundingSection'
import { RsoSearch } from './rsos/RsoSearch'
import { RsoCompare } from './rsos/RsoCompare'
import { AwardsSection } from './awards/AwardsSection'
import { ExpendituresSection } from './expenditures/ExpendituresSection'
import { CycleNav } from './nav/CycleNav'
import { SectionNav } from './nav/SectionNav'
import { DashboardControls, type StatusFilter } from './controls/DashboardControls'
import { useAllocations } from './data/useAllocations'
import { DEFAULT_CYCLE, cycleBySlug, type CycleSlug } from './data/cycles'
import type { Committee } from './data/stats'
import './App.css'

export default function App() {
  const [cycle, setCycle] = useState<CycleSlug>(DEFAULT_CYCLE)
  const { data, error } = useAllocations(cycle)

  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [topN, setTopN] = useState<number>(25)

  // Reset filters when the cycle changes so the user isn't confused by stale state.
  useEffect(() => {
    setSelectedCommittee(null)
    setStatusFilter('all')
    setTopN(25)
  }, [cycle])

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
      <SectionNav />
      <main className="app">
        <Hero
          key={`hero-${cycle}`}
          data={data}
          cycle={cycleBySlug(cycle)}
          onExplore={handleScrollPastHero}
        />
        <CommitteeGrid
          key={`committees-${cycle}`}
          data={data}
          selectedCommittee={selectedCommittee}
          onSelectCommittee={setSelectedCommittee}
          topN={topN}
          controlsSlot={
            <DashboardControls
              selectedCommittee={selectedCommittee}
              onSelectCommittee={setSelectedCommittee}
              status={statusFilter}
              onSelectStatus={setStatusFilter}
              topN={topN}
              onSelectTopN={setTopN}
            />
          }
        />
        <RsoSearch
          key={`rsos-${cycle}`}
          data={data}
          selectedCommittee={selectedCommittee}
        />
        <FundingSection
          key={`funding-${cycle}`}
          data={data}
          selectedCommittee={selectedCommittee}
          status={statusFilter}
          topN={topN}
        />
        <AwardsSection key={`awards-${cycle}`} data={data} />
        <RsoCompare
          key={`compare-${cycle}`}
          data={data}
          selectedCommittee={selectedCommittee}
        />
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
