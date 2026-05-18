import { useEffect, useState } from 'react'

type SectionLink = {
  id: string
  label: string
}

const SECTIONS: SectionLink[] = [
  { id: 'committees', label: 'Committees' },
  { id: 'rso-search', label: 'Find your RSO' },
  { id: 'funding', label: 'Funding' },
  { id: 'awards', label: 'Awards' },
  { id: 'expenditures', label: 'Other USG expenditures' },
]

export function SectionNav() {
  const [active, setActive] = useState<string>(SECTIONS[0].id)

  useEffect(() => {
    const observed = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    )
    if (observed.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    )

    for (const el of observed) observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <nav className="section-nav" aria-label="Jump to section">
      <ul>
        {SECTIONS.map((s) => {
          const isActive = active === s.id
          return (
            <li key={s.id}>
              <button
                type="button"
                className={`section-nav-link${isActive ? ' is-active' : ''}`}
                onClick={() => jump(s.id)}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className="section-nav-dot" aria-hidden />
                <span className="section-nav-label">{s.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
