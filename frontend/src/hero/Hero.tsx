import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Allocations } from '../data/stats'
import { SLIDE_MS } from '../theme'
import { buildSlides } from './slides'

const PauseIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
    <rect x="3" y="2" width="3" height="12" fill="currentColor" />
    <rect x="10" y="2" width="3" height="12" fill="currentColor" />
  </svg>
)

const PlayIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
    <path d="M3 2 L13 8 L3 14 Z" fill="currentColor" />
  </svg>
)

const SkipIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
    <path d="M2 2 L11 8 L2 14 Z" fill="currentColor" />
    <rect x="12" y="2" width="2" height="12" fill="currentColor" />
  </svg>
)

const ShareIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
    <path
      d="M8 1 L4 5 L5.4 6.4 L7 4.8 L7 11 L9 11 L9 4.8 L10.6 6.4 L12 5 Z M3 9 L3 14 L13 14 L13 9 L11 9 L11 12 L5 12 L5 9 Z"
      fill="currentColor"
    />
  </svg>
)

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

type Props = {
  data: Allocations
  onScrollPastHero?: () => void
}

export function Hero({ data, onScrollPastHero }: Props) {
  const slides = useMemo(() => buildSlides(data), [data])
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(() => prefersReducedMotion())
  const [shareLabel, setShareLabel] = useState<'idle' | 'copied'>('idle')

  const atLast = idx === slides.length - 1

  useEffect(() => {
    if (paused) return
    if (atLast) return
    const t = setTimeout(() => setIdx((i) => i + 1), SLIDE_MS)
    return () => clearTimeout(t)
  }, [idx, paused, atLast])

  const skip = () => {
    if (atLast) {
      onScrollPastHero?.()
    } else {
      setIdx((i) => Math.min(i + 1, slides.length - 1))
    }
  }

  const togglePause = () => setPaused((p) => !p)

  const share = async () => {
    const caption = slides[idx].caption
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const payload = { title: 'UChicago USG Allocations', text: caption, url }
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(payload)
        return
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(`${caption}\n${url}`)
        setShareLabel('copied')
        setTimeout(() => setShareLabel('idle'), 1800)
      }
    } catch {
      // user cancelled share — no-op
    }
  }

  const slide = slides[idx]

  return (
    <section className="hero" aria-label="Year in review">
      <div className="hero-bar">
        <div className="hero-dots" role="tablist" aria-label="Slides">
          {slides.map((s, i) => {
            const state =
              i === idx ? 'is-active' : i < idx ? 'is-past' : 'is-future'
            return (
              <button
                key={s.id}
                type="button"
                className={`hero-dot ${state}`}
                role="tab"
                aria-label={`Slide ${i + 1} of ${slides.length}`}
                aria-current={i === idx ? 'true' : undefined}
                onClick={() => setIdx(i)}
              >
                <span
                  className="hero-dot-fill"
                  style={{
                    animationDuration: `${SLIDE_MS}ms`,
                    animationPlayState: paused || i !== idx ? 'paused' : 'running',
                  }}
                />
              </button>
            )
          })}
        </div>
        <div className="hero-controls">
          <button
            type="button"
            className="hero-ctrl"
            onClick={togglePause}
            aria-label={paused ? 'Play' : 'Pause'}
          >
            {paused ? <PlayIcon /> : <PauseIcon />}
          </button>
          <button
            type="button"
            className="hero-ctrl"
            onClick={skip}
            aria-label={atLast ? 'Scroll to committees' : 'Next slide'}
          >
            <SkipIcon />
          </button>
          <button
            type="button"
            className="hero-ctrl hero-share"
            onClick={share}
            aria-label="Share this slide"
          >
            <ShareIcon />
            {shareLabel === 'copied' && (
              <span className="hero-share-toast" aria-live="polite">
                Copied
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="hero-stage" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            className="hero-slide"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -28 }}
            transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {slide.body}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
