import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Allocations } from '../data/stats'
import type { Cycle } from '../data/cycles'
import { SLIDE_MS } from '../theme'
import { buildSlides } from './slides'
import { ShareCard } from './ShareCard'

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

const PrevIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
    <rect x="2" y="2" width="2" height="12" fill="currentColor" />
    <path d="M14 2 L5 8 L14 14 Z" fill="currentColor" />
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

const HERO_BG_PALETTE = [
  // 0 — deep maroon, top-left hotspot
  `radial-gradient(120% 80% at 20% 0%, #5c0000 0%, transparent 55%),
   radial-gradient(120% 80% at 100% 100%, #b13a3a 0%, transparent 60%),
   linear-gradient(180deg, #3a0000 0%, #800000 60%, #5c0000 100%)`,
  // 1 — warmer, bottom-right hotspot
  `radial-gradient(120% 80% at 80% 10%, #9a2323 0%, transparent 60%),
   radial-gradient(140% 90% at 0% 100%, #c75a5a 0%, transparent 60%),
   linear-gradient(195deg, #3a0000 0%, #6b0000 55%, #800000 100%)`,
  // 2 — centered glow
  `radial-gradient(110% 70% at 50% 30%, #c75a5a 0%, transparent 55%),
   radial-gradient(140% 100% at 50% 100%, #3a0000 0%, transparent 65%),
   linear-gradient(180deg, #5c0000 0%, #800000 50%, #3a0000 100%)`,
  // 3 — split top, soft bottom
  `radial-gradient(90% 60% at 0% 0%, #9a2323 0%, transparent 60%),
   radial-gradient(90% 60% at 100% 0%, #c75a5a 0%, transparent 60%),
   linear-gradient(180deg, #3a0000 0%, #5c0000 60%, #800000 100%)`,
  // 4 — bright top-right, ink base
  `radial-gradient(130% 90% at 100% 0%, #c75a5a 0%, transparent 55%),
   radial-gradient(120% 80% at 20% 100%, #5c0000 0%, transparent 60%),
   linear-gradient(200deg, #3a0000 0%, #800000 70%, #3a0000 100%)`,
  // 5 — quiet, deep wash for closing beats
  `radial-gradient(110% 70% at 50% 80%, #800000 0%, transparent 60%),
   linear-gradient(180deg, #3a0000 0%, #5c0000 100%)`,
] as const

type Props = {
  data: Allocations
  cycle: Cycle
  onExplore?: () => void
}

export function Hero({ data, cycle, onExplore }: Props) {
  const slides = useMemo(
    () => buildSlides(data, cycle, { onExplore }),
    [data, cycle, onExplore],
  )
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(() => prefersReducedMotion())
  const [shareLabel, setShareLabel] = useState<'idle' | 'rendering' | 'saved'>('idle')
  const shareRef = useRef<HTMLDivElement | null>(null)

  const atFirst = idx === 0
  const atLast = idx === slides.length - 1

  useEffect(() => {
    if (paused) return
    if (atLast) return
    const t = setTimeout(() => setIdx((i) => i + 1), SLIDE_MS)
    return () => clearTimeout(t)
  }, [idx, paused, atLast])

  const next = () => {
    if (atLast) {
      onExplore?.()
    } else {
      setIdx((i) => Math.min(i + 1, slides.length - 1))
    }
  }

  const prev = () => setIdx((i) => Math.max(0, i - 1))

  const togglePause = () => setPaused((p) => !p)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't hijack arrow keys when typing in a form field.
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target?.isContentEditable
      ) {
        return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const share = async () => {
    if (!shareRef.current) {
      console.error('[share] shareRef not mounted')
      return
    }
    setShareLabel('rendering')
    let dataUrl: string | null = null
    try {
      if (typeof document !== 'undefined' && document.fonts?.ready) {
        await document.fonts.ready
      }
      const { toPng } = await import('html-to-image')
      dataUrl = await toPng(shareRef.current, {
        pixelRatio: 1,
        cacheBust: true,
        width: 1080,
        height: 1920,
        // Override the offscreen positioning on the clone — otherwise the
        // cloned node keeps `left: -10000px` and renders off the canvas.
        style: {
          position: 'static',
          left: '0',
          top: '0',
          transform: 'none',
          margin: '0',
        },
      })
    } catch (err) {
      console.error('[share] failed to render PNG', err)
      setShareLabel('idle')
      return
    }

    const fileName = `usg-${cycle.slug}-recap.png`

    // Try native share with file on touch devices that actually support it.
    const isTouchPrimary =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(pointer: coarse)').matches === true
    if (isTouchPrimary && typeof navigator !== 'undefined' && navigator.canShare) {
      try {
        const blob = await (await fetch(dataUrl)).blob()
        const file = new File([blob], fileName, { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'UChicago USG Allocations',
            text: slides[idx].caption,
            files: [file],
          })
          setShareLabel('idle')
          return
        }
      } catch (err) {
        console.warn('[share] native share failed, falling back to download', err)
      }
    }

    // Desktop / fallback: trigger a download.
    try {
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      setShareLabel('saved')
      setTimeout(() => setShareLabel('idle'), 1800)
    } catch (err) {
      console.error('[share] download failed', err)
      setShareLabel('idle')
    }
  }

  const slide = slides[idx]
  const bgIndex = idx % HERO_BG_PALETTE.length

  return (
    <section className="hero" aria-label="Year in review">
      <AnimatePresence initial={false}>
        <motion.div
          key={`hero-bg-${bgIndex}`}
          className="hero-bg"
          style={{ backgroundImage: HERO_BG_PALETTE[bgIndex] }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
          aria-hidden
        />
      </AnimatePresence>

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
            onClick={prev}
            disabled={atFirst}
            aria-label="Previous slide"
          >
            <PrevIcon />
          </button>
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
            onClick={next}
            aria-label={atLast ? 'Explore the data' : 'Next slide'}
          >
            <SkipIcon />
          </button>
          <button
            type="button"
            className="hero-ctrl hero-share"
            onClick={share}
            disabled={shareLabel === 'rendering'}
            aria-label="Share this slide as an image"
          >
            <ShareIcon />
            {shareLabel === 'saved' && (
              <span className="hero-share-toast" aria-live="polite">
                Saved
              </span>
            )}
            {shareLabel === 'rendering' && (
              <span className="hero-share-toast" aria-live="polite">
                Rendering…
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="hero-stage" aria-live="polite">
        <button
          type="button"
          className="hero-zone hero-zone-prev"
          onClick={prev}
          disabled={atFirst}
          aria-label="Previous slide"
          tabIndex={-1}
        />
        <button
          type="button"
          className="hero-zone hero-zone-next"
          onClick={next}
          aria-label={atLast ? 'Explore the data' : 'Next slide'}
          tabIndex={-1}
        />
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

      <div ref={shareRef} className="share-card-host" aria-hidden>
        <ShareCard data={data} cycle={cycle} />
      </div>
    </section>
  )
}
