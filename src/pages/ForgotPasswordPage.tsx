import gsap from 'gsap'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AnimatedAuthLayout } from '../components/auth/AnimatedAuthLayout'
import '../styles/auth-pages.css'

export function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [done, setDone] = useState(false)
  const errorRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (!error || !errorRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(
      errorRef.current,
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' },
    )
  }, [error])

  function handleRequestOtp(e: FormEvent) {
    e.preventDefault()
    setError('')
    const v = identifier.trim()
    if (!v) {
      setError('Enter your username or email.')
      return
    }
    const looksEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
    if (!looksEmail && v.length < 2) {
      setError('Enter a valid username or email.')
      return
    }
    setSent(true)
  }

  function handleVerify(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!/^\d{4,8}$/.test(otp.trim())) {
      setError('Enter the OTP from your email (4–8 digits).')
      return
    }
    setDone(true)
  }

  return (
    <AnimatedAuthLayout
      eyebrow="Account recovery"
      title="Reset access,"
      titleAccent="stay secure."
      description="We’ll email a one-time code so you can set a new password and get back in."
    >
      <h1 className="auth-form-title" data-auth-form-reveal>
        Forgot password
      </h1>
      <p className="auth-form-sub" data-auth-form-reveal>
        Enter your username or email. We’ll send an OTP to your registered address.
      </p>

      {!done ? (
        <form onSubmit={sent ? handleVerify : handleRequestOtp} noValidate>
          <div className="form-field" data-auth-form-reveal>
            <label htmlFor="fp-identifier">Username or email</label>
            <input
              id="fp-identifier"
              name="identifier"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Username or email"
              disabled={sent}
            />
          </div>
          {sent ? (
            <div className="form-field" data-auth-form-reveal>
              <label htmlFor="fp-otp">OTP from email</label>
              <input
                id="fp-otp"
                name="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="Enter OTP"
              />
            </div>
          ) : null}
          {error ? (
            <p ref={errorRef} className="form-error">
              {error}
            </p>
          ) : null}
          {sent ? (
            <button type="submit" className="btn-primary" data-auth-form-reveal>
              Verify OTP & continue
            </button>
          ) : (
            <button type="submit" className="btn-primary" data-auth-form-reveal>
              Send OTP to email
            </button>
          )}
        </form>
      ) : (
        <p
          className="form-success-banner"
          data-auth-form-reveal
          style={{ marginBottom: '1rem' }}
        >
          OTP verified (demo). In a real app you would set a new password here.
        </p>
      )}

      <p className="auth-footer" data-auth-form-reveal>
        <Link to="/login" className="auth-inline-link">
          Back to sign in
        </Link>
      </p>
    </AnimatedAuthLayout>
  )
}
