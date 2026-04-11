import gsap from 'gsap'
import { useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'

type AnimatedAuthLayoutProps = {
  eyebrow: string
  title: string
  titleAccent?: string
  description: string
  children: ReactNode
}

export function AnimatedAuthLayout({
  eyebrow,
  title,
  titleAccent,
  description,
  children,
}: AnimatedAuthLayoutProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.from('[data-auth-orb]', {
        scale: 0,
        opacity: 0,
        duration: 1,
        stagger: 0.14,
        ease: 'back.out(1.35)',
      })

      tl.from(
        '[data-auth-visual-line]',
        { y: 36, opacity: 0, duration: 0.75, stagger: 0.12 },
        '-=0.65',
      )

      tl.from(
        '[data-auth-form-shell]',
        { x: 56, opacity: 0, duration: 0.9, ease: 'power3.out' },
        '-=0.85',
      )

      tl.from(
        '[data-auth-form-reveal]',
        { y: 20, opacity: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' },
        '-=0.55',
      )

      gsap.to('[data-auth-orb="a"]', {
        y: -22,
        x: 14,
        duration: 4.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
      gsap.to('[data-auth-orb="b"]', {
        y: 26,
        x: -18,
        duration: 5.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
      gsap.to('[data-auth-orb="c"]', {
        y: 16,
        x: 20,
        duration: 4.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      gsap.to('[data-auth-glow]', {
        opacity: 0.5,
        scale: 1.12,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      gsap.to('[data-auth-ring]', {
        rotation: 360,
        duration: 48,
        repeat: -1,
        ease: 'none',
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={rootRef} className="auth-split">
      <div className="auth-split-visual" aria-hidden>
        <div className="auth-visual-grid" />
        <div className="auth-visual-glow" data-auth-glow />
        <div className="auth-orbs" aria-hidden>
          <div className="auth-orb auth-orb--sm" data-auth-orb="a" />
          <div className="auth-orb auth-orb--md" data-auth-orb="b" />
          <div className="auth-orb auth-orb--lg" data-auth-orb="c" />
        </div>
        <div className="auth-ring-wrap">
          <div className="auth-ring" data-auth-ring />
        </div>
        <div className="auth-visual-copy">
          <p className="auth-eyebrow" data-auth-visual-line>
            {eyebrow}
          </p>
          <h2 className="auth-visual-title" data-auth-visual-line>
            {title}
            {titleAccent ? (
              <>
                <br />
                <span className="auth-visual-accent">{titleAccent}</span>
              </>
            ) : null}
          </h2>
          <p className="auth-visual-desc" data-auth-visual-line>
            {description}
          </p>
        </div>
      </div>

      <div className="auth-split-form">
        <div className="auth-form-shell" data-auth-form-shell>
          <div className="auth-form-glass">{children}</div>
        </div>
      </div>
    </div>
  )
}
