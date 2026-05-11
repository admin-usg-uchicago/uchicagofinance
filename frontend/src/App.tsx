import { useState } from 'react'
import { Hero } from './hero/Hero'
import { CommitteeGrid } from './committees/CommitteeGrid'
import { RsoSearch } from './rsos/RsoSearch'
import { useAllocations } from './data/useAllocations'
import type { Committee } from './data/stats'
import './App.css'

export default function App() {
  const { data, error } = useAllocations()
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(
    null,
  )

  const handleCommitteeSelect = (c: Committee) => {
    setSelectedCommittee(c)
    requestAnimationFrame(() => {
      document
        .getElementById('rso-search')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const handleScrollPastHero = () => {
    document
      .getElementById('committees')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (error) {
    return (
      <main className="app-status">
        <h1>Couldn&rsquo;t load allocations</h1>
        <p>{error.message}</p>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="app-status">
        <p>Loading allocations&hellip;</p>
      </main>
    )
  }

  return (
    <main className="app">
      <Hero data={data} onScrollPastHero={handleScrollPastHero} />
      <CommitteeGrid data={data} onCommitteeSelect={handleCommitteeSelect} />
      <RsoSearch
        data={data}
        selectedCommittee={selectedCommittee}
        onClearCommittee={() => setSelectedCommittee(null)}
      />
      <footer className="app-foot">
        <p>
          UChicago Undergraduate Student Government &middot; 2025&ndash;26
          allocations.{' '}
          <a
            href="https://voices.uchicago.edu/ucusg/"
            target="_blank"
            rel="noreferrer"
          >
            About USG
          </a>
        </p>
      </footer>
    </main>
  )
}
