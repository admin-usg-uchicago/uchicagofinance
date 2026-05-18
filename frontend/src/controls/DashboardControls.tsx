import {
  COMMITTEES,
  COMMITTEE_LABELS,
  COMMITTEE_SHORT,
  type Committee,
} from '../data/stats'

export type StatusFilter = 'all' | 'fully' | 'partial' | 'denied'

const TOP_N_OPTIONS: { value: number; label: string }[] = [
  { value: 10, label: '10' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: Number.POSITIVE_INFINITY, label: 'All' },
]

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'fully', label: 'Fully funded' },
  { value: 'partial', label: 'Partial' },
  { value: 'denied', label: '$0 / denied' },
]

type Props = {
  selectedCommittee: Committee | null
  onSelectCommittee: (c: Committee | null) => void
  status: StatusFilter
  onSelectStatus: (s: StatusFilter) => void
  topN: number
  onSelectTopN: (n: number) => void
}

export function DashboardControls({
  selectedCommittee,
  onSelectCommittee,
  status,
  onSelectStatus,
  topN,
  onSelectTopN,
}: Props) {
  return (
    <section className="dashboard-controls" aria-label="Dashboard filters">
      <div className="dc-row">
        <span className="dc-row-label">Committee</span>
        <div className="dc-pills" role="tablist" aria-label="Filter by committee">
          <Pill
            active={selectedCommittee === null}
            onClick={() => onSelectCommittee(null)}
            label="All"
          />
          {COMMITTEES.map((c) => (
            <Pill
              key={c}
              active={selectedCommittee === c}
              onClick={() => onSelectCommittee(c)}
              label={COMMITTEE_SHORT[c]}
              title={COMMITTEE_LABELS[c]}
            />
          ))}
        </div>
      </div>

      <div className="dc-row">
        <span className="dc-row-label">Status</span>
        <div className="dc-pills" role="tablist" aria-label="Filter by funding status">
          {STATUS_OPTIONS.map((opt) => (
            <Pill
              key={opt.value}
              active={status === opt.value}
              onClick={() => onSelectStatus(opt.value)}
              label={opt.label}
            />
          ))}
        </div>
      </div>

      <div className="dc-row">
        <span className="dc-row-label">Show top</span>
        <div className="dc-pills" role="tablist" aria-label="Rankings depth">
          {TOP_N_OPTIONS.map((opt) => (
            <Pill
              key={opt.label}
              active={topN === opt.value}
              onClick={() => onSelectTopN(opt.value)}
              label={opt.label}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function Pill({
  active,
  onClick,
  label,
  title,
}: {
  active: boolean
  onClick: () => void
  label: string
  title?: string
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`dc-pill${active ? ' dc-pill--active' : ''}`}
      onClick={onClick}
      title={title}
    >
      {label}
    </button>
  )
}
