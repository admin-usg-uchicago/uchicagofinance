type Props = {
  label: string
  message: string
}

export function TbdCard({ label, message }: Props) {
  return (
    <div className="tbd-card" role="status">
      <span className="tbd-card-eyebrow">{label}</span>
      <p className="tbd-card-message">{message}</p>
    </div>
  )
}
