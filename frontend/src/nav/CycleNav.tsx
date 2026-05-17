import { CYCLES, type CycleSlug } from '../data/cycles'

type Props = {
  current: CycleSlug
  onSelect: (slug: CycleSlug) => void
}

export function CycleNav({ current, onSelect }: Props) {
  return (
    <nav className="cycle-nav" aria-label="Allocation cycle">
      <div className="cycle-nav-inner">
        <a className="cycle-nav-brand" href="#hero">
          UChicago USG <span>Allocations</span>
        </a>
        <div className="cycle-nav-pills" role="tablist" aria-label="Select cycle">
          {CYCLES.map((c) => {
            const active = c.slug === current
            return (
              <button
                key={c.slug}
                type="button"
                role="tab"
                aria-selected={active}
                className={`cycle-pill${active ? ' cycle-pill--active' : ''}`}
                onClick={() => onSelect(c.slug)}
              >
                <span className="cycle-pill-label">{c.label}</span>
                {c.tag && <span className="cycle-pill-tag">{c.tag}</span>}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
