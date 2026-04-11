import gsap from 'gsap'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatedAuthLayout } from '../components/auth/AnimatedAuthLayout'
import '../styles/auth-pages.css'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const registered = (location.state as { registered?: boolean } | null)?.registered

  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
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

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!userId.trim()) {
      setError('Please enter your user ID.')
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }
    navigate('/chat')
  }

  return (
    <AnimatedAuthLayout
      eyebrow="Aadhaar Chat"
      title="Welcome back to"
      titleAccent="secure messaging."
      description="Sign in with your credentials. End-to-end trust starts with verified identity."
    >
      <h1 className="auth-form-title" data-auth-form-reveal>
        Sign in
      </h1>
      <p className="auth-form-sub" data-auth-form-reveal>
        Enter your user ID and password to open your inbox.
      </p>

      {registered ? (
        <p className="form-success-banner" data-auth-form-reveal>
          Registration successful. You can sign in now.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-field" data-auth-form-reveal>
          <label htmlFor="login-userid">User ID</label>
          <input
            id="login-userid"
            name="userId"
            autoComplete="username"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Username or email"
          />
        </div>
        <div className="form-field" data-auth-form-reveal>
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div className="auth-form-meta" data-auth-form-reveal>
          <span />
          <Link to="/forgot-password" className="auth-inline-link">
            Forgot password?
          </Link>
        </div>

        {error ? (
          <p ref={errorRef} className="form-error">
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn-primary" data-auth-form-reveal>
          Sign in
        </button>
      </form>

      <p className="auth-footer" data-auth-form-reveal>
        New here?{' '}
        <Link to="/register" className="auth-inline-link">
          Create an account
        </Link>
      </p>
    </AnimatedAuthLayout>
  )
}
