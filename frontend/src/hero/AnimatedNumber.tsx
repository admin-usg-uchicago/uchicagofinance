import { useEffect, useState } from 'react'
import { animate, useMotionValue } from 'motion/react'
import { COUNTER_MS } from '../theme'

type Props = {
  value: number
  format: (n: number) => string
  durationMs?: number
}

export function AnimatedNumber({ value, format, durationMs = COUNTER_MS }: Props) {
  const mv = useMotionValue(0)
  const [display, setDisplay] = useState(() => format(0))

  useEffect(() => {
    mv.set(0)
    setDisplay(format(0))
    const controls = animate(mv, value, {
      duration: durationMs / 1000,
      ease: [0.2, 0.7, 0.2, 1],
      onUpdate: (latest) => setDisplay(format(latest)),
    })
    return () => controls.stop()
  }, [value, durationMs, format, mv])

  return <span>{display}</span>
}
